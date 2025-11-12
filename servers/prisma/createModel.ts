import { callMCPTool } from '../client';

/**
 * Input for creating an API model
 */
export interface CreateModelInput {
  name: string;
  schema: string;
  generatedByAI?: boolean;
  aiPrompt?: string;
  requiresAuth?: boolean;
}

/**
 * Output from creating an API model
 */
export interface CreateModelOutput {
  success: boolean;
  message: string;
  data?: {
    model: {
      id: string;
      name: string;
      schema: string;
      generatedByAI: boolean;
      aiPrompt: string | null;
      requiresAuth: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  error?: string;
}

/**
 * Create a new API model in the database
 *
 * @example
 * const result = await createModel({
 *   name: "products",
 *   schema: JSON.stringify({ name: "string", price: "number" }),
 *   requiresAuth: true
 * });
 *
 * if (result.success) {
 *   console.log(`API created: /api/${result.data.model.name}`);
 * }
 */
export async function createModel(
  input: CreateModelInput
): Promise<CreateModelOutput> {
  return callMCPTool<CreateModelOutput>('prisma__create_model', input);
}
