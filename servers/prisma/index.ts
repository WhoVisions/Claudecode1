/**
 * Prisma Database MCP Server
 * Provides database operations for API models and keys
 */

export * from './createModel';
export * from './getModels';

// Re-export for convenience
export { createModel } from './createModel';
export { getModels } from './getModels';

/**
 * Additional Prisma tools available via callMCPTool directly:
 * - prisma__get_model - Get a specific model by name
 * - prisma__delete_model - Delete a model
 * - prisma__create_api_key - Create API key
 * - prisma__get_api_keys - Get all API keys
 * - prisma__delete_api_key - Delete API key
 * - prisma__toggle_api_key - Enable/disable API key
 */
