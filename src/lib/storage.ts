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
  writeBatch,
  deleteDoc,
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
  if (!userId) {
    console.warn("getApplicationsList called without a userId.");
    return [];
  }
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
    } else {
        console.error("An unexpected error occurred in getApplicationsList:", e);
    }
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
      } else {
        console.error("An unexpected error occurred in getApplicationById:", e);
      }
      return undefined;
  }
}

export async function saveApplication(
  applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events' | 'notes'> & { notes?: string }
): Promise<Application | null> {
  if (!applicationData.userId) {
      console.error("saveApplication requires a userId.");
      return null;
  }
  const now = new Date();
  const appliedAt = applicationData.appliedAt instanceof Date ? applicationData.appliedAt : new Date();
  const applicationsCollection = collection(db, 'applications');

  const appDocData = {
      ...applicationData,
      appliedAt: Timestamp.fromDate(appliedAt),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
      tags: [],
  };
  delete (appDocData as any).notes;

  try {
    const docRef = await addDoc(applicationsCollection, appDocData).catch(e => {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: `${applicationsCollection.path}/${appDocData.userId}`,
                requestResourceData: appDocData
            }));
        }
        throw e;
    });
    const newId = docRef.id;

    const eventCollRef = collection(db, 'applications', newId, 'events');
    const eventData = { type: 'applied', occurredAt: Timestamp.fromDate(appliedAt) };
    await addDoc(eventCollRef, eventData).catch(e => {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: eventCollRef.path,
                requestResourceData: eventData
            }));
        }
    });

    if (applicationData.notes) {
        const notesCollRef = collection(db, 'applications', newId, 'notes');
        const noteData = { text: applicationData.notes, createdAt: Timestamp.fromDate(now) };
        await addDoc(notesCollRef, noteData).catch(e => {
            if (e instanceof FirestoreError && e.code === 'permission-denied') {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    operation: 'create',
                    path: notesCollRef.path,
                    requestResourceData: noteData
                }));
            }
        });
    }

    const newApp = await getApplicationById(newId);
    if (!newApp) {
        return null;
    }
    
    return newApp;

  } catch (e) {
      if (!(e instanceof FirestoreError && e.code === 'permission-denied')) {
        console.error("An unexpected error occurred during saveApplication:", e);
      }
      return null;
  }
}

export async function deleteApplication(applicationId: string): Promise<boolean> {
    const appDocRef = doc(db, 'applications', applicationId);
    try {
        const batch = writeBatch(db);

        // Delete sub-collections first
        const subcollections = ['notes', 'events'];
        for (const sub of subcollections) {
            const subcollectionRef = collection(db, 'applications', applicationId, sub);
            const snapshot = await getDocs(subcollectionRef);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
        }

        // Delete the main document
        batch.delete(appDocRef);

        await batch.commit();
        return true;
    } catch (e) {
        if (e instanceof FirestoreError && e.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'delete',
                path: appDocRef.path
            }));
        } else {
            console.error("An unexpected error occurred in deleteApplication:", e);
        }
        return false;
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
        } else {
             console.error(`An unexpected error occurred fetching ${subcollectionName}:`, e);
        }
        return [];
    }
}
