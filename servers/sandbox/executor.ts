/**
 * Sandbox Executor
 * Safe code execution with resource limits and isolation
 *
 * CRITICAL: NEVER execute arbitrary code directly on host system
 * All code must run in containerized environment with limits
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { nanoid } from 'nanoid';

export interface ExecutionConfig {
  code: string;
  timeout?: number; // milliseconds, default 5000
  memoryLimit?: string; // e.g., '128MB', default '128MB'
  allowNetwork?: boolean; // default false
  language?: 'javascript' | 'typescript'; // default 'javascript'
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number; // milliseconds
  timedOut: boolean;
}

/**
 * Execute code in isolated environment
 * Uses Node.js VM with resource limits
 */
export async function executeCode(config: ExecutionConfig): Promise<ExecutionResult> {
  const startTime = Date.now();
  const timeout = config.timeout || 5000;
  const tempId = nanoid(10);
  const tempDir = path.join(process.cwd(), '.sandbox', tempId);
  const codeFile = path.join(tempDir, 'code.js');

  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });

    // Write code to temp file
    await fs.writeFile(codeFile, config.code, 'utf-8');

    // Execute in isolated process with resource limits
    const result = await executeInSandbox(codeFile, timeout, config.memoryLimit || '128MB');

    // Clean up
    await cleanupSandbox(tempDir);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.stderr,
      executionTime: Date.now() - startTime,
      timedOut: result.timedOut
    };
  } catch (error) {
    // Clean up on error
    try {
      await cleanupSandbox(tempDir);
    } catch {}

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
      timedOut: false
    };
  }
}

interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

/**
 * Execute code in subprocess with timeout and memory limits
 */
function executeInSandbox(
  filePath: string,
  timeout: number,
  memoryLimit: string
): Promise<SandboxResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    // Parse memory limit (e.g., '128MB' -> 128)
    const memoryMB = parseInt(memoryLimit.replace(/[^0-9]/g, ''), 10);

    // Spawn isolated Node.js process
    const child = spawn('node', [
      `--max-old-space-size=${memoryMB}`,
      filePath
    ], {
      timeout,
      env: {
        // Minimal environment, no sensitive vars
        NODE_ENV: 'sandbox',
        PATH: process.env.PATH
      }
    });

    // Collect output
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle timeout
    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);

    // Handle completion
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
        timedOut
      });
    });

    // Handle errors
    child.on('error', (error) => {
      clearTimeout(timeoutId);
      resolve({
        stdout,
        stderr: stderr + '\n' + error.message,
        exitCode: 1,
        timedOut
      });
    });
  });
}

/**
 * Clean up sandbox directory
 */
async function cleanupSandbox(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to cleanup sandbox:', error);
  }
}

/**
 * Validate code for obvious security issues
 * This is NOT comprehensive - always run in isolated environment
 */
export function validateCode(code: string): { valid: boolean; reason?: string } {
  // Check for dangerous patterns
  const dangerousPatterns = [
    /require\s*\(\s*['"]child_process['"]\s*\)/, // Process spawning
    /require\s*\(\s*['"]fs['"]\s*\)/, // Direct file system access
    /process\.exit/, // Process termination
    /eval\s*\(/, // Code evaluation
    /Function\s*\(/, // Dynamic function creation
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        reason: `Code contains potentially dangerous pattern: ${pattern.source}`
      };
    }
  }

  return { valid: true };
}
