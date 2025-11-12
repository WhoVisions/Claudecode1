/**
 * MCP Servers Index
 * Central export point for all MCP tool servers
 *
 * Usage:
 * import * as gemini from './servers/gemini';
 * import * as prisma from './servers/prisma';
 * import * as apikey from './servers/apikey';
 *
 * const schema = await gemini.generateSchema({
 *   description: "User profiles",
 *   apiName: "users"
 * });
 *
 * await prisma.createModel({
 *   name: "users",
 *   schema: JSON.stringify(schema.schema),
 *   generatedByAI: true
 * });
 */

export * as gemini from './gemini';
export * as prisma from './prisma';
export * as apikey from './apikey';
export * as sandbox from './sandbox';

export { searchMCPTools, callMCPTool } from './client';

/**
 * Get all available MCP servers
 */
export function listServers(): string[] {
  return ['gemini', 'prisma', 'apikey', 'sandbox'];
}

/**
 * Server descriptions for discovery
 */
export const SERVER_DESCRIPTIONS = {
  gemini: 'AI-powered schema generation and API naming using Google Gemini',
  prisma: 'Database operations for API models, data, and authentication keys',
  apikey: 'Secure API key generation and validation',
  sandbox: 'Safe code execution environment for testing generated APIs'
};
