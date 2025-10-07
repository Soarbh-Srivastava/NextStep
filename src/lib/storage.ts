'use client';

import { Application, Note } from './types';
import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  Timestamp,
  FirestoreError,
} from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from './errors';

// Helper to convert Firestore Timestamps to Dates in a deeply nested object
function convertTimestampsToDates(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Timestamp) {
    return obj.toDate();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertTimestampsToDates);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = convertTimestampsToDates(obj[key]);
    }
  }
  return newObj;
}


export async function getApplicationsList(userId: string): Promise<Omit<Application, 'notes' | 'events'>[]> {
  if (!userId) return [];
  const q = query(collection(db, 'applications'), where('userId', '==', userId));
  try {
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      const appWithDates = convertTimestampsToDates(data);
      return {
        ...appWithDates,
        id: docSnapshot.id,
      } as Omit<Application, 'notes' | 'events'>;
    });
    return applications;
  } catch (e) {
    if (e instanceof FirestoreError && e.code === 'permission-denied') {
        const error = new FirestorePermissionError({operation: 'list', path: `applications`});
        errorEmitter.emit('permission-error', error);
    }
    // Return empty array on error to prevent app crash
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const docRef = doc(db, 'applications', id);
  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const appWithDates = convertTimestampsToDates(data);
      const [notes, events] = await Promise.all([
        fetchSubcollection(id, 'notes'),
        fetchSubcollection(id, 'events')
      ]);

      return { ...appWithDates, id: docSnap.id, notes, events } as Application;
    } else {
      return undefined;
    }
  } catch (e) {
      if (e instanceof FirestoreError && e.code === 'permission-denied') {
        const error = new FirestorePermissionError({operation: 'get', path: docRef.path});
        errorEmitter.emit('permission-error', error);
      }
      return undefined;
  }
}

export async function saveApplication(
  applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events' | 'notes'> & { notes?: string }
): Promise<Application | null> {
  const now = new Date();
  const appliedAt = applicationData.appliedAt instanceof Date ? applicationData.appliedAt : new Date();
  const applicationsCollection = collection(db, 'applications');

  // Create the main application document data
  const appDocData = {
      ...applicationData,
      appliedAt: Timestamp.fromDate(appliedAt),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      tags: [],
  };
  // We handle notes and events separately
  delete (appDocData as any).notes;

  try {
    // Add the application document
    const docRef = await addDoc(applicationsCollection, appDocData);
    const newId = docRef.id;

    // Add the initial 'applied' event
    const eventCollRef = collection(db, 'applications', newId, 'events');
    await addDoc(eventCollRef, {
        type: 'applied',
        occurredAt: Timestamp.fromDate(appliedAt),
    }).catch(e => {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: eventCollRef.path,
                requestResourceData: { type: 'applied', occurredAt: Timestamp.fromDate(appliedAt) }
            }));
        }
    });

    // Add initial note if present
    if (applicationData.notes) {
        const notesCollRef = collection(db, 'applications', newId, 'notes');
        await addDoc(notesCollRef, {
            text: applicationData.notes,
            createdAt: Timestamp.fromDate(now),
        }).catch(e => {
            if (e instanceof FirestoreError && e.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    operation: 'create',
                    path: notesCollRef.path,
                    requestResourceData: { text: applicationData.notes, createdAt: Timestamp.fromDate(now) }
                }));
            }
        });
    }

    // Fetch the newly created application to return it
    const newApp = await getApplicationById(newId);
    if (!newApp) {
        // This might happen if there's a permission error on get, which getApplicationById should handle
        return null;
    }
    
    return newApp;

  } catch (e) {
      if (e instanceof FirestoreError && e.code === 'permission-denied') {
        const error = new FirestorePermissionError({operation: 'create', path: applicationsCollection.path, requestResourceData: appDocData});
        errorEmitter.emit('permission-error', error);
      } else {
        // Re-throw other errors or handle them as needed
        console.error("An unexpected error occurred during saveApplication:", e);
      }
      return null;
  }
}

async function fetchSubcollection(applicationId: string, subcollectionName: string) {
    const subcollectionRef = collection(db, 'applications', applicationId, subcollectionName);
    try {
        const snapshot = await getDocs(subcollectionRef);
        return snapshot.docs.map(doc => ({ ...convertTimestampsToDates(doc.data()), id: doc.id }));
    } catch(e) {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            const error = new FirestorePermissionError({operation: 'list', path: subcollectionRef.path});
            errorEmitter.emit('permission-error', error);
        }
        return [];
    }
}
