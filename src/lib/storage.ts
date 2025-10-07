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


export async function getApplications(userId: string = 'user-1'): Promise<Application[]> {
  const q = query(collection(db, 'applications'), where('userId', '==', userId));
  try {
    const querySnapshot = await getDocs(q);
    const applications = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      const appWithDates = convertTimestampsToDates(data);
      const [notes, events] = await Promise.all([
        fetchSubcollection(docSnapshot.id, 'notes'),
        fetchSubcollection(docSnapshot.id, 'events')
      ]);
      return {
        ...appWithDates,
        id: docSnapshot.id,
        notes,
        events,
      } as Application;
    }));
    return applications;
  } catch (e) {
    if (e instanceof FirestoreError && e.code === 'permission-denied') {
        const error = new FirestorePermissionError('list', `applications`, e);
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
        const error = new FirestorePermissionError('read', docRef.path, e);
        errorEmitter.emit('permission-error', error);
      }
      return undefined;
  }
}

export async function saveApplication(
  applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events' | 'notes'> & { notes?: string }
): Promise<Application> {
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
    });

    // Add initial note if present
    if (applicationData.notes) {
        const notesCollRef = collection(db, 'applications', newId, 'notes');
        await addDoc(notesCollRef, {
            text: applicationData.notes,
            createdAt: Timestamp.fromDate(now),
        });
    }

    // Fetch the newly created application to return it
    const newApp = await getApplicationById(newId);
    if (!newApp) {
        throw new Error("Failed to retrieve newly created application");
    }
    
    return newApp;

  } catch (e) {
      if (e instanceof FirestoreError && e.code === 'permission-denied') {
        const error = new FirestorePermissionError('write', applicationsCollection.path, e, appDocData);
        errorEmitter.emit('permission-error', error);
      }
      // Re-throw other errors or handle them as needed
      throw e;
  }
}

async function fetchSubcollection(applicationId: string, subcollectionName: string) {
    const subcollectionRef = collection(db, 'applications', applicationId, subcollectionName);
    try {
        const snapshot = await getDocs(subcollectionRef);
        return snapshot.docs.map(doc => ({ ...convertTimestampsToDates(doc.data()), id: doc.id }));
    } catch(e) {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            const error = new FirestorePermissionError('list', subcollectionRef.path, e);
            errorEmitter.emit('permission-error', error);
        }
        return [];
    }
}