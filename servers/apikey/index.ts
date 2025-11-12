/**
 * API Key Management MCP Server
 * Provides secure API key generation and validation
 */

import { callMCPTool } from '../client';

/**
 * Generate a new secure API key
 *
 * @example
 * const { key } = await generateApiKey();
 * console.log(key); // "ak_<32-char-nanoid>"
 */
export async function generateApiKey(): Promise<{ key: string }> {
  return callMCPTool('apikey__generate', {});
}

/**
 * Validate API key format
 *
 * @example
 * const { valid } = await validateApiKeyFormat({ key: "ak_abc123..." });
 * if (valid) {
 *   console.log("Key format is valid");
 * }
 */
export async function validateApiKeyFormat(input: {
  key: string;
}): Promise<{ valid: boolean }> {
  return callMCPTool('apikey__validate', input);
}
