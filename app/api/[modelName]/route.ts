import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Dynamic API Route Handler
 * Handles CRUD operations for user-created APIs
 */

interface RouteContext {
  params: Promise<{ modelName: string }>
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

    // For now, return a placeholder response
    // In a full implementation, you would store data in a separate table
    return NextResponse.json({
      message: 'API endpoint is active',
      modelName,
      schema: JSON.parse(apiModel.schema),
      note: 'To store actual data, you would need to implement a data storage layer'
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

    // Return success (in full implementation, you would save to database)
    return NextResponse.json({
      message: 'Record created successfully',
      data: {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString()
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

    // Return success (in full implementation, you would update in database)
    return NextResponse.json({
      message: 'Record updated successfully',
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString()
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

    // Return success (in full implementation, you would delete from database)
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
