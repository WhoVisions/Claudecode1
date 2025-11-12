import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Dynamic API Route Handler
 * Handles CRUD operations for user-created APIs
 * Supports API key authentication
 */

interface RouteContext {
  params: Promise<{ modelName: string }>
}

/**
 * Validate API key for protected endpoints
 */
async function validateApiKey(
  request: NextRequest,
  modelId: string
): Promise<{ valid: boolean; error?: string }> {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key')

  if (!apiKey) {
    return { valid: false, error: 'Missing API key. Include X-API-Key header.' }
  }

  try {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    })

    if (!key) {
      return { valid: false, error: 'Invalid API key.' }
    }

    if (key.modelId !== modelId) {
      return { valid: false, error: 'API key not valid for this endpoint.' }
    }

    if (!key.isActive) {
      return { valid: false, error: 'API key has been disabled.' }
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() }
    })

    return { valid: true }
  } catch (error) {
    console.error('API key validation error:', error)
    return { valid: false, error: 'Failed to validate API key.' }
  }
}

/**
 * GET - Fetch all records or a specific record
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { modelName } = await context.params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Verify the API model exists
    const apiModel = await prisma.apiModel.findUnique({
      where: { name: modelName }
    })

    if (!apiModel) {
      return NextResponse.json(
        { error: 'API not found', message: `No API exists with name "${modelName}"` },
        { status: 404 }
      )
    }

    // Check if authentication is required
    if (apiModel.requiresAuth) {
      const authResult = await validateApiKey(request, apiModel.id)
      if (!authResult.valid) {
        return NextResponse.json(
          { error: 'Unauthorized', message: authResult.error },
          { status: 401 }
        )
      }
    }

    // Fetch records from database
    if (id) {
      // Get specific record
      const record = await prisma.apiData.findFirst({
        where: {
          id,
          modelId: apiModel.id
        }
      })

      if (!record) {
        return NextResponse.json(
          { error: 'Record not found', message: `No record found with id "${id}"` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        id: record.id,
        ...JSON.parse(record.data),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      })
    }

    // Get all records with pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      prisma.apiData.findMany({
        where: { modelId: apiModel.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.apiData.count({
        where: { modelId: apiModel.id }
      })
    ])

    return NextResponse.json({
      data: records.map(record => ({
        id: record.id,
        ...JSON.parse(record.data),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new record
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { modelName } = await context.params
    const body = await request.json()

    // Verify the API model exists
    const apiModel = await prisma.apiModel.findUnique({
      where: { name: modelName }
    })

    if (!apiModel) {
      return NextResponse.json(
        { error: 'API not found', message: `No API exists with name "${modelName}"` },
        { status: 404 }
      )
    }

    // Check if authentication is required
    if (apiModel.requiresAuth) {
      const authResult = await validateApiKey(request, apiModel.id)
      if (!authResult.valid) {
        return NextResponse.json(
          { error: 'Unauthorized', message: authResult.error },
          { status: 401 }
        )
      }
    }

    const schema = JSON.parse(apiModel.schema)

    // Validate the request body against schema
    const validationErrors: string[] = []
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in body)) {
        validationErrors.push(`Missing required field: ${key}`)
      } else {
        const actualType = typeof body[key]
        const expectedType = type as string

        // Basic type validation
        if (expectedType === 'number' && actualType !== 'number') {
          validationErrors.push(`Field "${key}" should be a number`)
        } else if (expectedType === 'string' && actualType !== 'string') {
          validationErrors.push(`Field "${key}" should be a string`)
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          validationErrors.push(`Field "${key}" should be a boolean`)
        } else if (expectedType === 'array' && !Array.isArray(body[key])) {
          validationErrors.push(`Field "${key}" should be an array`)
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validationErrors },
        { status: 400 }
      )
    }

    // Store data in database
    const record = await prisma.apiData.create({
      data: {
        modelId: apiModel.id,
        data: JSON.stringify(body)
      }
    })

    return NextResponse.json({
      message: 'Record created successfully',
      data: {
        id: record.id,
        ...body,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update a record
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { modelName } = await context.params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Missing ID', message: 'Please provide an ID in the query string' },
        { status: 400 }
      )
    }

    // Verify the API model exists
    const apiModel = await prisma.apiModel.findUnique({
      where: { name: modelName }
    })

    if (!apiModel) {
      return NextResponse.json(
        { error: 'API not found', message: `No API exists with name "${modelName}"` },
        { status: 404 }
      )
    }

    // Check if authentication is required
    if (apiModel.requiresAuth) {
      const authResult = await validateApiKey(request, apiModel.id)
      if (!authResult.valid) {
        return NextResponse.json(
          { error: 'Unauthorized', message: authResult.error },
          { status: 401 }
        )
      }
    }

    // Check if record exists
    const existingRecord = await prisma.apiData.findFirst({
      where: {
        id,
        modelId: apiModel.id
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Record not found', message: `No record found with id "${id}"` },
        { status: 404 }
      )
    }

    // Merge existing data with updates
    const existingData = JSON.parse(existingRecord.data)
    const updatedData = { ...existingData, ...body }

    // Update record in database
    const record = await prisma.apiData.update({
      where: { id },
      data: {
        data: JSON.stringify(updatedData)
      }
    })

    return NextResponse.json({
      message: 'Record updated successfully',
      data: {
        id: record.id,
        ...updatedData,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    })
  } catch (error: any) {
    console.error('PUT Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a record
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { modelName } = await context.params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing ID', message: 'Please provide an ID in the query string' },
        { status: 400 }
      )
    }

    // Verify the API model exists
    const apiModel = await prisma.apiModel.findUnique({
      where: { name: modelName }
    })

    if (!apiModel) {
      return NextResponse.json(
        { error: 'API not found', message: `No API exists with name "${modelName}"` },
        { status: 404 }
      )
    }

    // Check if authentication is required
    if (apiModel.requiresAuth) {
      const authResult = await validateApiKey(request, apiModel.id)
      if (!authResult.valid) {
        return NextResponse.json(
          { error: 'Unauthorized', message: authResult.error },
          { status: 401 }
        )
      }
    }

    // Check if record exists
    const existingRecord = await prisma.apiData.findFirst({
      where: {
        id,
        modelId: apiModel.id
      }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Record not found', message: `No record found with id "${id}"` },
        { status: 404 }
      )
    }

    // Delete record from database
    await prisma.apiData.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Record deleted successfully',
      id
    })
  } catch (error: any) {
    console.error('DELETE Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
