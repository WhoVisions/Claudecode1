import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAuth } from 'google-auth-library';

/**
 * Gemini API Service
 * Handles all interactions with Google's Gemini API
 * Supports both API key and Service Account authentication
 */

export interface GeminiServiceOptions {
  apiKey?: string;
  serviceAccountCredentials?: any;
}

export class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private apiKey?: string;
  private serviceAccountCredentials?: any;

  constructor(options: GeminiServiceOptions | string) {
    // Support both old (string) and new (options object) constructors
    if (typeof options === 'string') {
      this.apiKey = options;
      if (options) {
        this.client = new GoogleGenerativeAI(options);
      }
    } else {
      this.apiKey = options.apiKey;
      this.serviceAccountCredentials = options.serviceAccountCredentials;

      if (options.apiKey) {
        this.client = new GoogleGenerativeAI(options.apiKey);
      } else if (options.serviceAccountCredentials) {
        // Initialize with service account
        this.initializeWithServiceAccount();
      }
    }
  }

  /**
   * Initialize Gemini client using Service Account credentials
   */
  private async initializeWithServiceAccount() {
    try {
      const auth = new GoogleAuth({
        credentials: this.serviceAccountCredentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });

      // Get an access token from the service account
      const client = await auth.getClient();
      const token = await client.getAccessToken();

      if (token.token) {
        // Use the access token as API key for Gemini
        this.client = new GoogleGenerativeAI(token.token);
      }
    } catch (error) {
      console.error('Failed to initialize with service account:', error);
    }
  }

  /**
   * Generate a JSON schema from a natural language description
   */
  async generateSchema(
    description: string,
    apiName: string
  ): Promise<{ schema: Record<string, string>; error?: string }> {
    if (!this.client) {
      return { schema: {}, error: 'Gemini API key not configured' };
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an API schema generator. Generate a JSON schema based on this description:
"${description}"

For API named: "${apiName}"

Requirements:
- Return ONLY a valid JSON object, no markdown, no explanations
- Use lowercase keys with hyphens for multi-word keys (e.g., "user-name", "is-active")
- Include appropriate data types: "string", "number", "boolean", "array", or "object"
- Add descriptive field names
- Keep it practical and useful
- Do not include any text before or after the JSON object

Example output format:
{
  "name": "string",
  "price": "number",
  "description": "string",
  "in-stock": "boolean",
  "tags": "array"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse and validate the response
      const schema = this.validateGeminiResponse(text);

      if (!schema) {
        return {
          schema: {},
          error: 'Invalid response format from Gemini. Please try again.'
        };
      }

      return { schema };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return {
        schema: {},
        error: error.message || 'Failed to generate schema. Please check your API key and try again.'
      };
    }
  }

  /**
   * Suggest an API name based on description
   */
  async suggestApiName(description: string): Promise<{ name: string; error?: string }> {
    if (!this.client) {
      return { name: '', error: 'Gemini API key not configured' };
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Based on this API description, suggest a short, descriptive API name (2-3 words max, lowercase with hyphens):

Description: "${description}"

Return ONLY the suggested name, nothing else. Examples: "user-profile", "product-catalog", "task-manager"`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const name = response.text().trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

      return { name };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return { name: '', error: error.message || 'Failed to suggest name' };
    }
  }

  /**
   * Refine an existing schema based on user feedback
   */
  async refineSchema(
    currentSchema: Record<string, string>,
    refinementRequest: string
  ): Promise<{ schema: Record<string, string>; error?: string }> {
    if (!this.client) {
      return { schema: currentSchema, error: 'Gemini API key not configured' };
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Refine this JSON schema based on the user's request:

Current Schema:
${JSON.stringify(currentSchema, null, 2)}

User Request: "${refinementRequest}"

Requirements:
- Return ONLY a valid JSON object, no markdown, no explanations
- Keep the same format and style
- Apply the user's requested changes
- Use lowercase keys with hyphens for multi-word keys

Return only the modified JSON schema.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const schema = this.validateGeminiResponse(text);

      if (!schema) {
        return {
          schema: currentSchema,
          error: 'Invalid response format from Gemini. Please try again.'
        };
      }

      return { schema };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return {
        schema: currentSchema,
        error: error.message || 'Failed to refine schema'
      };
    }
  }

  /**
   * Validate and parse Gemini's response
   */
  private validateGeminiResponse(response: string): Record<string, string> | null {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();

      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }

      cleanedResponse = cleanedResponse.trim();

      // Parse the JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate it's an object
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
      }

      // Validate all values are valid types
      const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== 'string' || !validTypes.includes(value)) {
          console.warn(`Invalid type for key ${key}: ${value}`);
        }
      }

      return parsed as Record<string, string>;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return null;
    }
  }

  /**
   * Test the API key validity
   */
  async testApiKey(): Promise<{ valid: boolean; error?: string }> {
    if (!this.client) {
      return { valid: false, error: 'No API key provided' };
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hello');
      const response = result.response;
      response.text(); // This will throw if invalid

      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message || 'Invalid API key' };
    }
  }

  /**
   * Generate OpenAPI 3.0 specification for an API
   */
  async generateOpenApiSpec(
    modelName: string,
    schema: Record<string, string>,
    requiresAuth: boolean
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `Generate a complete OpenAPI 3.0 JSON specification for a REST API.
The API resource is named "${modelName}".
The API has full CRUD operations:
- GET /api/${modelName} (List records with pagination: page, limit)
- POST /api/${modelName} (Create a new record)
- GET /api/${modelName}?id={id} (Get a single record by ID)
- PUT /api/${modelName}?id={id} (Update a record by ID)
- DELETE /api/${modelName}?id={id} (Delete a record by ID)

The JSON schema for the resource is:
${JSON.stringify(schema, null, 2)}

${requiresAuth ? 'All endpoints are protected and require an API key passed in the "X-API-Key" header.' : 'All endpoints are public.'}

Please ensure the generated JSON is valid and includes:
- A 'paths' object for all 5 operations.
- 'requestBody' definitions for POST and PUT.
- 'parameters' for the 'id' query param on GET, PUT, DELETE.
- 'parameters' for 'page' and 'limit' on the GET (List) endpoint.
- A 'components.schemas' object for the resource ("${modelName}") and its input ("${modelName}Input" - without id, createdAt, updatedAt).
${requiresAuth ? "- A 'components.securitySchemes' object for 'ApiKeyAuth' (type: apiKey, in: header, name: X-API-Key)." : ''}
${requiresAuth ? "- A global 'security' requirement object." : ''}

Return *only* the raw JSON object, starting with { and ending with }.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Clean up potential markdown formatting
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      jsonText = jsonText.trim();

      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('Failed to generate OpenAPI spec:', error);
      throw new Error('AI returned invalid JSON or generation failed');
    }
  }

  /**
   * Generate content (generic method for any prompt)
   */
  async generateContent(prompt: string): Promise<any> {
    if (!this.client) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' });
    return await model.generateContent(prompt);
  }
}

/**
 * Create a Gemini service instance
 */
export function createGeminiService(options: GeminiServiceOptions | string): GeminiService {
  return new GeminiService(options);
}
