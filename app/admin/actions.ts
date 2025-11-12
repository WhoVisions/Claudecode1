'use server'

import { prisma } from '@/lib/prisma'
import { createGeminiService } from '@/lib/gemini'
import { generateApiKey } from '@/lib/apiKey'
import { revalidatePath } from 'next/cache'

export type FormState = {
  success: boolean
  message: string
  data?: any
  error?: string
}

/**
 * Get Gemini API key from database
 */
export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'gemini_api_key' }
    })
    return setting?.value || null
  } catch (error) {
    console.error('Error fetching Gemini API key:', error)
    return null
  }
}

/**
 * Save Gemini API key to database
 */
export async function saveGeminiApiKey(apiKey: string): Promise<FormState> {
  try {
    if (!apiKey || apiKey.trim().length === 0) {
      return {
        success: false,
        message: 'API key cannot be empty',
        error: 'API key is required'
      }
    }

    // Test the API key first
    const geminiService = createGeminiService(apiKey)
    const testResult = await geminiService.testApiKey()

    if (!testResult.valid) {
      return {
        success: false,
        message: 'Invalid API key',
        error: testResult.error || 'The provided API key is not valid'
      }
    }

    // Save to database
    await prisma.setting.upsert({
      where: { key: 'gemini_api_key' },
      update: { value: apiKey },
      create: { key: 'gemini_api_key', value: apiKey }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: 'Gemini API key saved successfully!'
    }
  } catch (error: any) {
    console.error('Error saving Gemini API key:', error)
    return {
      success: false,
      message: 'Failed to save API key',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Generate schema using Gemini AI
 */
export async function generateSchemaWithGemini(
  description: string,
  apiName: string
): Promise<FormState> {
  try {
    if (!description || description.trim().length === 0) {
      return {
        success: false,
        message: 'Description cannot be empty',
        error: 'Please provide a description of what you want to store'
      }
    }

    // Get API key
    const apiKey = await getGeminiApiKey()

    if (!apiKey) {
      return {
        success: false,
        message: 'Gemini API key not configured',
        error: 'Please add your Gemini API key in the settings first'
      }
    }

    // Generate schema
    const geminiService = createGeminiService(apiKey)
    const result = await geminiService.generateSchema(description, apiName)

    if (result.error) {
      return {
        success: false,
        message: 'Failed to generate schema',
        error: result.error
      }
    }

    return {
      success: true,
      message: 'Schema generated successfully!',
      data: { schema: result.schema }
    }
  } catch (error: any) {
    console.error('Error generating schema:', error)
    return {
      success: false,
      message: 'Failed to generate schema',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Suggest API name using Gemini AI
 */
export async function suggestApiNameWithGemini(description: string): Promise<FormState> {
  try {
    if (!description || description.trim().length === 0) {
      return {
        success: false,
        message: 'Description cannot be empty',
        error: 'Please provide a description'
      }
    }

    const apiKey = await getGeminiApiKey()

    if (!apiKey) {
      return {
        success: false,
        message: 'Gemini API key not configured',
        error: 'Please add your Gemini API key first'
      }
    }

    const geminiService = createGeminiService(apiKey)
    const result = await geminiService.suggestApiName(description)

    if (result.error) {
      return {
        success: false,
        message: 'Failed to suggest name',
        error: result.error
      }
    }

    return {
      success: true,
      message: 'Name suggested successfully!',
      data: { name: result.name }
    }
  } catch (error: any) {
    console.error('Error suggesting name:', error)
    return {
      success: false,
      message: 'Failed to suggest name',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Create a new API model
 */
export async function createModel(
  name: string,
  schema: string,
  generatedByAI: boolean = false,
  aiPrompt?: string,
  requiresAuth: boolean = false
): Promise<FormState> {
  try {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        message: 'API name cannot be empty',
        error: 'API name is required'
      }
    }

    if (!schema || schema.trim().length === 0) {
      return {
        success: false,
        message: 'Schema cannot be empty',
        error: 'Schema is required'
      }
    }

    // Validate JSON schema
    try {
      JSON.parse(schema)
    } catch (e) {
      return {
        success: false,
        message: 'Invalid JSON schema',
        error: 'The schema must be valid JSON'
      }
    }

    // Normalize name
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-')

    // Check if model already exists
    const existing = await prisma.apiModel.findUnique({
      where: { name: normalizedName }
    })

    if (existing) {
      return {
        success: false,
        message: 'API already exists',
        error: `An API with the name "${normalizedName}" already exists`
      }
    }

    // Create model
    const model = await prisma.apiModel.create({
      data: {
        name: normalizedName,
        schema,
        generatedByAI,
        aiPrompt: aiPrompt || null,
        requiresAuth
      }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: `API "${normalizedName}" created successfully!`,
      data: { model }
    }
  } catch (error: any) {
    console.error('Error creating model:', error)
    return {
      success: false,
      message: 'Failed to create API',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Get all API models
 */
export async function getModels(): Promise<FormState> {
  try {
    const models = await prisma.apiModel.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      message: 'Models fetched successfully',
      data: { models }
    }
  } catch (error: any) {
    console.error('Error fetching models:', error)
    return {
      success: false,
      message: 'Failed to fetch models',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Get a single API model by name
 */
export async function getModel(name: string): Promise<FormState> {
  try {
    const model = await prisma.apiModel.findUnique({
      where: { name }
    })

    if (!model) {
      return {
        success: false,
        message: 'API not found',
        error: `No API found with name "${name}"`
      }
    }

    return {
      success: true,
      message: 'Model fetched successfully',
      data: { model }
    }
  } catch (error: any) {
    console.error('Error fetching model:', error)
    return {
      success: false,
      message: 'Failed to fetch model',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Delete an API model
 */
export async function deleteModel(id: string): Promise<FormState> {
  try {
    await prisma.apiModel.delete({
      where: { id }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: 'API deleted successfully!'
    }
  } catch (error: any) {
    console.error('Error deleting model:', error)
    return {
      success: false,
      message: 'Failed to delete API',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Create an API key for a model
 */
export async function createApiKey(modelId: string, keyName: string): Promise<FormState> {
  try {
    const model = await prisma.apiModel.findUnique({
      where: { id: modelId }
    })

    if (!model) {
      return {
        success: false,
        message: 'API not found',
        error: 'The specified API does not exist'
      }
    }

    const key = generateApiKey()

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: keyName,
        modelId
      }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: 'API key created successfully!',
      data: { apiKey: { ...apiKey, key } }
    }
  } catch (error: any) {
    console.error('Error creating API key:', error)
    return {
      success: false,
      message: 'Failed to create API key',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Get API keys for a model
 */
export async function getApiKeys(modelId: string): Promise<FormState> {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { modelId },
      orderBy: { createdAt: 'desc' }
    })

    // Don't return the actual keys for security
    const sanitizedKeys = apiKeys.map(k => ({
      ...k,
      key: `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}`
    }))

    return {
      success: true,
      message: 'API keys fetched successfully',
      data: { apiKeys: sanitizedKeys }
    }
  } catch (error: any) {
    console.error('Error fetching API keys:', error)
    return {
      success: false,
      message: 'Failed to fetch API keys',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id: string): Promise<FormState> {
  try {
    await prisma.apiKey.delete({
      where: { id }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: 'API key deleted successfully!'
    }
  } catch (error: any) {
    console.error('Error deleting API key:', error)
    return {
      success: false,
      message: 'Failed to delete API key',
      error: error.message || 'An unexpected error occurred'
    }
  }
}

/**
 * Toggle API key active status
 */
export async function toggleApiKey(id: string): Promise<FormState> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id }
    })

    if (!apiKey) {
      return {
        success: false,
        message: 'API key not found',
        error: 'The specified API key does not exist'
      }
    }

    await prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive }
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: `API key ${apiKey.isActive ? 'disabled' : 'enabled'} successfully!`
    }
  } catch (error: any) {
    console.error('Error toggling API key:', error)
    return {
      success: false,
      message: 'Failed to toggle API key',
      error: error.message || 'An unexpected error occurred'
    }
  }
}
