import { callMCPTool } from '../client';

/**
 * Input for API name suggestion
 */
export interface SuggestApiNameInput {
  description: string;
}

/**
 * Output from API name suggestion
 */
export interface SuggestApiNameOutput {
  name: string;
  error?: string;
}

/**
 * Suggest an API name based on a description
 *
 * @example
 * const result = await suggestApiName({
 *   description: "API for managing customer orders and shipping"
 * });
 * console.log(result.name);
 * // "customer-orders"
 */
export async function suggestApiName(
  input: SuggestApiNameInput
): Promise<SuggestApiNameOutput> {
  return callMCPTool<SuggestApiNameOutput>('gemini__suggest_api_name', input);
}
