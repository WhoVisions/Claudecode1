## Firebase Integration Guide

**Project**: AiwithDav3
**Firebase Project ID**: `aiwithdav3-d1d6a`
**Environment**: Production

---

## Overview

This application uses Firebase for:
- **Authentication** (Email/Password, Google OAuth)
- **Firestore Database** (NoSQL document database)
- **Cloud Storage** (File uploads)
- **Analytics** (User behavior tracking)
- **Cloud Messaging** (Push notifications)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install firebase firebase-admin
```

Already done ✅

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The Firebase client config is already set with your project credentials.

### 3. Get Service Account Key (for Admin SDK)

1. Go to [Firebase Console](https://console.firebase.google.com/project/aiwithdav3-d1d6a/settings/serviceaccounts/adminsdk)
2. Click "Generate New Private Key"
3. Download the JSON file
4. Add to `.env.local`:

```bash
# Option 1: Inline JSON (recommended for Vercel/Cloud platforms)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"..."}'

# Option 2: File path (for local development)
GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

---

## Usage

### Client-Side (Browser)

```typescript
// Import Firebase utilities
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  getCurrentUser
} from '@/lib/firebase';

// Sign up
await signUpWithEmail('user@example.com', 'password123', 'John Doe');

// Sign in
await signInWithEmail('user@example.com', 'password123');

// Google Sign In
await signInWithGoogle();

// Get current user
const user = getCurrentUser();

// Sign out
await signOut();
```

### Firestore Database

```typescript
import {
  createDocument,
  getDocument,
  getCollection,
  updateDocument,
  deleteDocument,
  queryDocuments
} from '@/lib/firebase';

// Create document
const docId = await createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

// Get document
const user = await getDocument('users', docId);

// Query documents
const admins = await queryDocuments('users', [
  { field: 'role', operator: '==', value: 'admin' }
], {
  orderByField: 'createdAt',
  orderByDirection: 'desc',
  limitCount: 10
});

// Update document
await updateDocument('users', docId, {
  name: 'Jane Doe'
});

// Delete document
await deleteDocument('users', docId);
```

### Server-Side (API Routes, Server Actions)

```typescript
import {
  getAdminAuth,
  getAdminFirestore,
  verifyIdToken,
  getUserByUid
} from '@/lib/firebase/admin';

// Verify ID token
const decodedToken = await verifyIdToken(idToken);
const uid = decodedToken.uid;

// Get user
const user = await getUserByUid(uid);

// Firestore Admin
const db = getAdminFirestore();
const usersRef = db.collection('users');
const snapshot = await usersRef.get();
```

---

## Authentication Patterns

### Protected API Route

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    // User is authenticated
    return NextResponse.json({ message: 'Protected data', uid });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

### Client Auth State Listener

```typescript
// app/components/AuthProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { subscribeToAuthState, User } from '@/lib/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
```

---

## Firestore Security Rules

Go to [Firestore Rules](https://console.firebase.google.com/project/aiwithdav3-d1d6a/firestore/rules) and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Admin only
    match /admin/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

---

## Storage Security Rules

Go to [Storage Rules](https://console.firebase.google.com/project/aiwithdav3-d1d6a/storage/rules) and set:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Cloud Messaging (Push Notifications)

### Setup

1. Get VAPID key from [Cloud Messaging settings](https://console.firebase.google.com/project/aiwithdav3-d1d6a/settings/cloudmessaging)
2. Current Web Push Certificate:
   ```
   BIb6OjsATXl20re7KKuiAt9S9eWiw728D5NagMNGjWRo2-2zMkukZapXlgrtH4qBTa4G9OxNbUyZNiGx4p5iFPU
   ```

### Client Setup

```typescript
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const messaging = getMessaging();

// Request permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  const token = await getToken(messaging, {
    vapidKey: 'BIb6OjsATXl20re7...'
  });

  // Save token to database
  await saveTokenToDatabase(token);
}

// Listen for messages
onMessage(messaging, (payload) => {
  console.log('Message received:', payload);
});
```

---

## Deployment Considerations

### Vercel/Netlify

Environment variables are already configured for NEXT_PUBLIC_* variables. Add:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Cloud Run/GCP

Use Application Default Credentials:

```bash
GOOGLE_APPLICATION_CREDENTIALS="/etc/secrets/serviceAccountKey.json"
```

Mount the secret as a volume in Cloud Run.

---

## Firebase Console Links

- **Project Overview**: https://console.firebase.google.com/project/aiwithdav3-d1d6a
- **Authentication**: https://console.firebase.google.com/project/aiwithdav3-d1d6a/authentication/users
- **Firestore**: https://console.firebase.google.com/project/aiwithdav3-d1d6a/firestore
- **Storage**: https://console.firebase.google.com/project/aiwithdav3-d1d6a/storage
- **Cloud Messaging**: https://console.firebase.google.com/project/aiwithdav3-d1d6a/notification
- **Service Accounts**: https://console.firebase.google.com/project/aiwithdav3-d1d6a/settings/serviceaccounts/adminsdk

---

## Testing

```bash
# Test authentication
npm run test:auth

# Test Firestore
npm run test:firestore

# Test Storage
npm run test:storage
```

---

## Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Enable Email/Password authentication in [Firebase Console → Authentication → Sign-in methods](https://console.firebase.google.com/project/aiwithdav3-d1d6a/authentication/providers)

### "Firebase Admin SDK initialization error"
- Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly in `.env.local`
- Verify JSON is properly escaped (no line breaks)

### "Missing or insufficient permissions"
- Check Firestore Security Rules
- Ensure user is authenticated before accessing protected collections

### "CORS error on signInWithGoogle"
- Add your domain to Authorized domains in [Firebase Console → Authentication → Settings](https://console.firebase.google.com/project/aiwithdav3-d1d6a/authentication/settings)

---

## Best Practices

1. **Never commit service account keys** - Use environment variables
2. **Use security rules** - Always protect your Firestore and Storage
3. **Validate on server** - Don't trust client-side validation alone
4. **Use indexes** - Create composite indexes for complex queries
5. **Paginate results** - Use `limit()` and `startAfter()` for large collections
6. **Handle errors** - All Firebase methods can throw errors
7. **Monitor usage** - Check [Firebase Usage dashboard](https://console.firebase.google.com/project/aiwithdav3-d1d6a/usage)

---

**Last Updated**: 2025-11-12
**Firebase SDK Version**: Latest
**Admin SDK Version**: Latest
