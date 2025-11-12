/**
 * Sandbox MCP Server
 * Provides safe code execution and API testing capabilities
 *
 * Tools:
 * - executeCode: Run code in isolated environment
 * - testApi: Validate generated API endpoints
 * - runTests: Execute comprehensive test suite
 */

import { callMCPTool } from '../client';
import {
  executeCode as executeCodeDirect,
  ExecutionConfig,
  ExecutionResult,
  validateCode
} from './executor';
import {
  testApi as testApiDirect,
  runValidationSuite,
  ApiTestConfig,
  TestResult
} from './testRunner';

/**
 * Execute code safely in sandbox
 *
 * @example
 * const result = await executeCode({
 *   code: 'console.log("Hello World")',
 *   timeout: 5000,
 *   memoryLimit: '128MB'
 * });
 */
export async function executeCode(config: ExecutionConfig): Promise<ExecutionResult> {
  return callMCPTool<ExecutionResult>('sandbox__execute_code', config);
}

/**
 * Test an API endpoint
 *
 * @example
 * const result = await testApi({
 *   apiName: 'users',
 *   schema: { name: { type: 'string' } },
 *   testCases: [{ method: 'GET', endpoint: '/api/users' }]
 * });
 */
export async function testApi(config: ApiTestConfig): Promise<TestResult> {
  return callMCPTool<TestResult>('sandbox__test_api', config);
}

/**
 * Run comprehensive test suite
 *
 * @example
 * const result = await runTests({
 *   apiName: 'products',
 *   schema: productSchema
 * });
 */
export async function runTests(config: { apiName: string; schema: any }): Promise<TestResult> {
  return callMCPTool<TestResult>('sandbox__run_tests', config);
}

// Direct exports for internal use (bypassing MCP layer)
export {
  executeCodeDirect,
  testApiDirect,
  runValidationSuite,
  validateCode
};

// Type exports
export type { ExecutionConfig, ExecutionResult, ApiTestConfig, TestResult };
