import { callMCPTool } from '../client';

/**
 * Input for schema generation
 */
export interface GenerateSchemaInput {
  description: string;
  apiName: string;
}

/**
 * Output from schema generation
 */
export interface GenerateSchemaOutput {
  schema: Record<string, string>;
  error?: string;
}

/**
 * Generate a JSON schema from a natural language description
 *
 * @example
 * const result = await generateSchema({
 *   description: "Store user profiles with name, email, and age",
 *   apiName: "user-profiles"
 * });
 * console.log(result.schema);
 * // { name: "string", email: "string", age: "number" }
 */
export async function generateSchema(
  input: GenerateSchemaInput
): Promise<GenerateSchemaOutput> {
  return callMCPTool<GenerateSchemaOutput>('gemini__generate_schema', input);
}
