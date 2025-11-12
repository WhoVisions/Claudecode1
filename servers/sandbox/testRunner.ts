/**
 * API Test Runner
 * Validates generated APIs by running test requests
 */

import { executeCode, ExecutionResult } from './executor';

export interface ApiTestConfig {
  apiName: string;
  schema: any;
  testCases?: TestCase[];
}

export interface TestCase {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  expectedStatus?: number;
  expectedFields?: string[];
}

export interface TestResult {
  success: boolean;
  totalTests: number;
  passed: number;
  failed: number;
  results: {
    test: string;
    passed: boolean;
    error?: string;
  }[];
  executionTime: number;
}

/**
 * Test a generated API
 */
export async function testApi(config: ApiTestConfig): Promise<TestResult> {
  const startTime = Date.now();

  // Generate default test cases if none provided
  const testCases = config.testCases || generateDefaultTests(config.apiName, config.schema);

  const results: TestResult['results'] = [];

  for (const testCase of testCases) {
    try {
      const result = await runTestCase(config.apiName, testCase);
      results.push(result);
    } catch (error) {
      results.push({
        test: `${testCase.method} ${testCase.endpoint}`,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return {
    success: failed === 0,
    totalTests: results.length,
    passed,
    failed,
    results,
    executionTime: Date.now() - startTime
  };
}

/**
 * Run a single test case
 */
async function runTestCase(
  apiName: string,
  testCase: TestCase
): Promise<TestResult['results'][0]> {
  // Generate test code
  const testCode = generateTestCode(apiName, testCase);

  // Execute in sandbox
  const result: ExecutionResult = await executeCode({
    code: testCode,
    timeout: 10000, // 10 seconds for HTTP requests
    memoryLimit: '256MB',
    allowNetwork: true // API tests need network access
  });

  if (!result.success) {
    return {
      test: `${testCase.method} ${testCase.endpoint}`,
      passed: false,
      error: result.error || 'Test execution failed'
    };
  }

  // Parse test output
  try {
    const output = JSON.parse(result.output || '{}');
    return {
      test: `${testCase.method} ${testCase.endpoint}`,
      passed: output.success === true,
      error: output.error
    };
  } catch (error) {
    return {
      test: `${testCase.method} ${testCase.endpoint}`,
      passed: false,
      error: 'Failed to parse test output'
    };
  }
}

/**
 * Generate test code for a test case
 */
function generateTestCode(apiName: string, testCase: TestCase): string {
  const { method, endpoint, body, headers = {}, expectedStatus = 200, expectedFields = [] } = testCase;

  return `
(async () => {
  try {
    const response = await fetch('${endpoint}', {
      method: '${method}',
      headers: ${JSON.stringify(headers)},
      ${body ? `body: JSON.stringify(${JSON.stringify(body)}),` : ''}
    });

    const data = await response.json();

    // Check status code
    if (response.status !== ${expectedStatus}) {
      console.log(JSON.stringify({
        success: false,
        error: \`Expected status ${expectedStatus}, got \${response.status}\`
      }));
      return;
    }

    // Check expected fields
    const expectedFields = ${JSON.stringify(expectedFields)};
    const missingFields = expectedFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      console.log(JSON.stringify({
        success: false,
        error: \`Missing fields: \${missingFields.join(', ')}\`
      }));
      return;
    }

    console.log(JSON.stringify({ success: true }));
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
})();
`;
}

/**
 * Generate default test cases based on schema
 */
function generateDefaultTests(apiName: string, schema: any): TestCase[] {
  const baseUrl = `http://localhost:3000/api/${apiName}`;

  const tests: TestCase[] = [
    // Test GET all
    {
      method: 'GET',
      endpoint: baseUrl,
      expectedStatus: 200,
      expectedFields: []
    },
    // Test POST create
    {
      method: 'POST',
      endpoint: baseUrl,
      body: generateSampleData(schema),
      expectedStatus: 201,
      expectedFields: ['id']
    }
  ];

  return tests;
}

/**
 * Generate sample data from schema
 */
function generateSampleData(schema: any): any {
  const data: any = {};

  for (const [key, def] of Object.entries(schema)) {
    const fieldDef = def as any;

    if (fieldDef.type === 'string') {
      data[key] = `sample_${key}`;
    } else if (fieldDef.type === 'number' || fieldDef.type === 'integer') {
      data[key] = 123;
    } else if (fieldDef.type === 'boolean') {
      data[key] = true;
    } else if (fieldDef.type === 'array') {
      data[key] = [];
    } else if (fieldDef.type === 'object') {
      data[key] = {};
    }
  }

  return data;
}

/**
 * Run comprehensive API validation suite
 */
export async function runValidationSuite(apiName: string, schema: any): Promise<TestResult> {
  const testCases: TestCase[] = [
    // CRUD operations
    ...generateDefaultTests(apiName, schema),

    // Additional validation tests can be added here
    // - Authentication tests
    // - Rate limiting tests
    // - Error handling tests
  ];

  return testApi({ apiName, schema, testCases });
}
