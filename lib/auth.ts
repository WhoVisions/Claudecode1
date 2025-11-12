/**
 * Authentication and Rate Limiting Middleware
 * Validates API keys and enforces usage quotas
 */

import { prisma } from './prisma';

export interface AuthResult {
  success: boolean;
  error?: string;
  status?: number;
}

/**
 * Authenticate request and check rate limits
 */
export async function authenticateAndRateLimit(
  request: Request,
  modelId: string
): Promise<AuthResult> {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return { success: false, error: 'Missing API key', status: 401 };
  }

  // 1. Find the key
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey, modelId: modelId },
  });

  if (!key) {
    return { success: false, error: 'Invalid API key', status: 401 };
  }

  if (!key.isActive) {
    return { success: false, error: 'API key is disabled', status: 401 };
  }

  // 2. Check rate limit
  if (key.usageCount >= key.usageLimit) {
    return {
      success: false,
      error: `API key quota exceeded (${key.usageCount}/${key.usageLimit} requests used)`,
      status: 429
    };
  }

  // 3. Increment usage (do this async without waiting)
  prisma.apiKey.update({
      where: { id: key.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })
    .catch((err) => console.error('Failed to increment usage count:', err));

  // 4. Success
  return { success: true };
}

/**
 * Reset usage count for an API key (e.g., monthly reset)
 */
export async function resetApiKeyUsage(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: { usageCount: 0 },
  });
}

/**
 * Get usage statistics for an API key
 */
export async function getApiKeyUsage(keyId: string): Promise<{
  usageCount: number;
  usageLimit: number;
  percentUsed: number;
  remaining: number;
}> {
  const key = await prisma.apiKey.findUnique({
    where: { id: keyId },
    select: { usageCount: true, usageLimit: true },
  });

  if (!key) {
    throw new Error('API key not found');
  }

  return {
    usageCount: key.usageCount,
    usageLimit: key.usageLimit,
    percentUsed: Math.round((key.usageCount / key.usageLimit) * 100),
    remaining: key.usageLimit - key.usageCount,
  };
}
