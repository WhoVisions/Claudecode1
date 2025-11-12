/**
 * Firebase SDK
 * Central export for all Firebase utilities
 */

// Client SDK
export * from './config';
export * from './auth';
export * from './firestore';

// Admin SDK (server-side only)
export * from './admin';

// Re-export commonly used Firebase types
export type { User, UserCredential } from 'firebase/auth';
export type { DocumentData, QueryConstraint } from 'firebase/firestore';
