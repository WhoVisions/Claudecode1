import { nanoid } from 'nanoid';

/**
 * API Key Utilities
 * Handles generation and validation of API keys
 */

/**
 * Generate a new API key
 * Format: ak_<24 character random string>
 */
export function generateApiKey(): string {
  return `ak_${nanoid(32)}`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^ak_[A-Za-z0-9_-]{32}$/.test(key);
}

/**
 * Hash API key for storage (in a real app, use proper hashing)
 * For now, we'll store them directly for simplicity
 */
export function hashApiKey(key: string): string {
  return key; // In production, use bcrypt or similar
}

/**
 * Verify API key middleware
 */
export function verifyApiKey(providedKey: string, storedKey: string): boolean {
  return providedKey === storedKey;
}
