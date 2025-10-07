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
} from 'firebase/firestore';

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
  const querySnapshot = await getDocs(q);
  const applications = querySnapshot.docs.map(doc => {
    const data = doc.data();
    const appWithDates = convertTimestampsToDates(data);
    return {
      ...appWithDates,
      id: doc.id,
    } as Application;
  });
  return applications;
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const docRef = doc(db, 'applications', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const appWithDates = convertTimestampsToDates(data);
    return { ...appWithDates, id: docSnap.id } as Application;
  } else {
    return undefined;
  }
}

export async function saveApplication(
  applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events' | 'notes'> & { notes?: string }
): Promise<Application> {
  const now = new Date();
  const appliedAt = applicationData.appliedAt instanceof Date ? applicationData.appliedAt : new Date();

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


  // Add the application document
  const docRef = await addDoc(collection(db, 'applications'), appDocData);
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
}

async function fetchSubcollection(applicationId: string, subcollectionName: string) {
    const subcollectionRef = collection(db, 'applications', applicationId, subcollectionName);
    const snapshot = await getDocs(subcollectionRef);
    return snapshot.docs.map(doc => ({ ...convertTimestampsToDates(doc.data()), id: doc.id }));
}
