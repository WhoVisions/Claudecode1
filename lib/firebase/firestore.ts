/**
 * Firestore Database Utilities
 * Client-side Firestore helpers
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Get a document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Get document error:', error);
    throw new Error('Failed to get document');
  }
}

/**
 * Get all documents in a collection
 */
export async function getCollection<T = DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Get collection error:', error);
    throw new Error('Failed to get collection');
  }
}

/**
 * Create a new document with auto-generated ID
 */
export async function createDocument<T = DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Create document error:', error);
    throw new Error('Failed to create document');
  }
}

/**
 * Set document with specific ID (create or overwrite)
 */
export async function setDocument<T = DocumentData>(
  collectionName: string,
  documentId: string,
  data: T,
  merge: boolean = false
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: Timestamp.now(),
      },
      { merge }
    );
  } catch (error) {
    console.error('Set document error:', error);
    throw new Error('Failed to set document');
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T = Partial<DocumentData>>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Update document error:', error);
    throw new Error('Failed to update document');
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete document error:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Query documents with filters
 */
export async function queryDocuments<T = DocumentData>(
  collectionName: string,
  filters: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
    value: any;
  }[],
  options?: {
    orderByField?: string;
    orderByDirection?: 'asc' | 'desc';
    limitCount?: number;
  }
): Promise<T[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    // Add where clauses
    filters.forEach((filter) => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });

    // Add ordering
    if (options?.orderByField) {
      constraints.push(
        orderBy(options.orderByField, options.orderByDirection || 'asc')
      );
    }

    // Add limit
    if (options?.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Query documents error:', error);
    throw new Error('Failed to query documents');
  }
}

/**
 * Firestore Timestamp utility
 */
export { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Convert Date to Firestore timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}
