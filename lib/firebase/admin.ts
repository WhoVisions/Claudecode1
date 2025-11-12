/**
 * Firebase Admin SDK Configuration
 * For use in server-side code (API routes, server actions)
 */

import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variable
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  try {
    // Option 1: Using service account JSON (recommended for development)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );

      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    // Option 2: Using Application Default Credentials (for Cloud Run/GCP)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    // Option 3: Manual service account configuration
    if (
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    ) {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    throw new Error('Firebase Admin credentials not configured');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
  }
}

// Initialize on import
const adminApp = initializeFirebaseAdmin();

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth() {
  return admin.auth();
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminFirestore() {
  return admin.firestore();
}

/**
 * Get Firebase Admin Storage instance
 */
export function getAdminStorage() {
  return admin.storage();
}

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(token: string) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string) {
  try {
    return await admin.auth().getUser(uid);
  } catch (error) {
    console.error('Get user error:', error);
    throw new Error('User not found');
  }
}

/**
 * Create custom token
 */
export async function createCustomToken(
  uid: string,
  claims?: object
): Promise<string> {
  try {
    return await admin.auth().createCustomToken(uid, claims);
  } catch (error) {
    console.error('Create custom token error:', error);
    throw new Error('Failed to create custom token');
  }
}

export default adminApp;
