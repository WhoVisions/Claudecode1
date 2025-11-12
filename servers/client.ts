/**
 * MCP Client Helper
 * Generic function for calling MCP tools
 * Follows the Model Context Protocol pattern for efficient tool use
 */

export interface MCPToolCall<TInput = any, TOutput = any> {
  tool: string;
  input: TInput;
}

export interface MCPToolResponse<TOutput = any> {
  success: boolean;
  data?: TOutput;
  error?: string;
}

/**
 * Call an MCP tool by name with typed input/output
 * This is the core abstraction that all server wrappers use
 */
export async function callMCPTool<TOutput = any, TInput = any>(
  toolName: string,
  input: TInput
): Promise<TOutput> {
  // In production, this would route to the actual MCP server
  // For now, we'll route to the local implementations

  try {
    // Route to appropriate handler based on tool name
    const [server, tool] = toolName.split('__');

    switch (server) {
      case 'gemini':
        return await handleGeminiTool(tool, input);

      case 'prisma':
        return await handlePrismaTool(tool, input);

      case 'apikey':
        return await handleApiKeyTool(tool, input);

      case 'sandbox':
        return await handleSandboxTool(tool, input);

      default:
        throw new Error(`Unknown MCP server: ${server}`);
    }
  } catch (error: any) {
    console.error(`MCP tool call failed: ${toolName}`, error);
    throw error;
  }
}

/**
 * Handle Gemini AI server tools
 */
async function handleGeminiTool(tool: string, input: any): Promise<any> {
  const { createGeminiService } = await import('../lib/gemini');
  const { getGeminiApiKey } = await import('../app/admin/actions');

  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const gemini = createGeminiService(apiKey);

  switch (tool) {
    case 'generate_schema':
      return await gemini.generateSchema(input.description, input.apiName);

    case 'suggest_api_name':
      return await gemini.suggestApiName(input.description);

    case 'test_api_key':
      return await gemini.testApiKey();

    default:
      throw new Error(`Unknown Gemini tool: ${tool}`);
  }
}

/**
 * Handle Prisma database server tools
 */
async function handlePrismaTool(tool: string, input: any): Promise<any> {
  const actions = await import('../app/admin/actions');

  switch (tool) {
    case 'create_model':
      return await actions.createModel(
        input.name,
        input.schema,
        input.generatedByAI,
        input.aiPrompt,
        input.requiresAuth
      );

    case 'get_models':
      return await actions.getModels();

    case 'get_model':
      return await actions.getModel(input.name);

    case 'delete_model':
      return await actions.deleteModel(input.id);

    case 'create_api_key':
      return await actions.createApiKey(input.modelId, input.keyName);

    case 'get_api_keys':
      return await actions.getApiKeys(input.modelId);

    case 'delete_api_key':
      return await actions.deleteApiKey(input.id);

    case 'toggle_api_key':
      return await actions.toggleApiKey(input.id);

    default:
      throw new Error(`Unknown Prisma tool: ${tool}`);
  }
}

/**
 * Handle API key management server tools
 */
async function handleApiKeyTool(tool: string, input: any): Promise<any> {
  const { generateApiKey, isValidApiKeyFormat } = await import('../lib/apiKey');

  switch (tool) {
    case 'generate':
      return { key: generateApiKey() };

    case 'validate':
      return { valid: isValidApiKeyFormat(input.key) };

    default:
      throw new Error(`Unknown API key tool: ${tool}`);
  }
}

/**
 * Handle sandbox execution server tools
 */
async function handleSandboxTool(tool: string, input: any): Promise<any> {
  const sandbox = await import('./sandbox');

  switch (tool) {
    case 'execute_code':
      return await sandbox.executeCodeDirect(input);

    case 'test_api':
      return await sandbox.testApiDirect(input);

    case 'run_tests':
      return await sandbox.runValidationSuite(input.apiName, input.schema);

    default:
      throw new Error(`Unknown sandbox tool: ${tool}`);
  }
}

/**
 * Search for available MCP tools
 * Returns tool names and descriptions for progressive disclosure
 */
export async function searchMCPTools(
  query: string,
  options: { namesOnly?: boolean } = {}
): Promise<Array<{ name: string; description?: string }>> {
  const allTools = [
    // Gemini tools
    {
      name: 'gemini__generate_schema',
      description: 'Generate a JSON schema from natural language description'
    },
    {
      name: 'gemini__suggest_api_name',
      description: 'Suggest an API name based on description'
    },
    {
      name: 'gemini__test_api_key',
      description: 'Test if Gemini API key is valid'
    },

    // Prisma tools
    {
      name: 'prisma__create_model',
      description: 'Create a new API model in the database'
    },
    {
      name: 'prisma__get_models',
      description: 'Get all API models'
    },
    {
      name: 'prisma__get_model',
      description: 'Get a specific API model by name'
    },
    {
      name: 'prisma__delete_model',
      description: 'Delete an API model'
    },
    {
      name: 'prisma__create_api_key',
      description: 'Create a new API key for a model'
    },
    {
      name: 'prisma__get_api_keys',
      description: 'Get all API keys for a model'
    },
    {
      name: 'prisma__delete_api_key',
      description: 'Delete an API key'
    },
    {
      name: 'prisma__toggle_api_key',
      description: 'Enable/disable an API key'
    },

    // API key tools
    {
      name: 'apikey__generate',
      description: 'Generate a new secure API key'
    },
    {
      name: 'apikey__validate',
      description: 'Validate API key format'
    },

    // Sandbox tools
    {
      name: 'sandbox__execute_code',
      description: 'Execute code safely in isolated environment'
    },
    {
      name: 'sandbox__test_api',
      description: 'Test API endpoints with validation'
    },
    {
      name: 'sandbox__run_tests',
      description: 'Run comprehensive test suite for an API'
    }
  ];

  // Filter by query
  const filtered = allTools.filter(tool =>
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Return names only if requested
  if (options.namesOnly) {
    return filtered.map(t => ({ name: t.name }));
  }

  return filtered;
}
