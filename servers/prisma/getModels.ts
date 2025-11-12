import { callMCPTool } from '../client';

/**
 * Output from getting all models
 */
export interface GetModelsOutput {
  success: boolean;
  message: string;
  data?: {
    models: Array<{
      id: string;
      name: string;
      schema: string;
      generatedByAI: boolean;
      aiPrompt: string | null;
      requiresAuth: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
  error?: string;
}

/**
 * Get all API models from the database
 *
 * @example
 * const result = await getModels();
 * if (result.success) {
 *   result.data.models.forEach(model => {
 *     console.log(`API: /api/${model.name}`);
 *   });
 * }
 */
export async function getModels(): Promise<GetModelsOutput> {
  return callMCPTool<GetModelsOutput>('prisma__get_models', {});
}
