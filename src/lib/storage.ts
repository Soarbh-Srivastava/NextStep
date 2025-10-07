'use client';

import { Application, Note, ApplicationEvent } from './types';
import { applications as seedData } from './data';

const APPLICATIONS_KEY = 'jobtrack_applications';

function getStoredApplications(): Application[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedData = localStorage.getItem(APPLICATIONS_KEY);
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      // Dates are stored as strings in JSON, so we need to convert them back
      return parsed.map((app: any) => ({
        ...app,
        appliedAt: new Date(app.appliedAt),
        createdAt: new Date(app.createdAt),
        updatedAt: new Date(app.updatedAt),
        notes: app.notes.map((note: any) => ({...note, createdAt: new Date(note.createdAt)})),
        events: app.events.map((event: any) => ({...event, occurredAt: new Date(event.occurredAt)}))
      }));
    } catch (error) {
      console.error('Error parsing applications from localStorage:', error);
      return [];
    }
  } else {
    // If no data, seed it from the data file
    setStoredApplications(seedData);
    return seedData;
  }
}

function setStoredApplications(applications: Application[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

export function getApplications(): Application[] {
    return getStoredApplications();
}

export function getApplicationById(id: string): Application | undefined {
    const applications = getStoredApplications();
    return applications.find(app => app.id === id);
}

export function saveApplication(applicationData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'events' | 'notes'> & { notes?: string }) {
    const applications = getStoredApplications();
    const id = `app-${Date.now()}`;
    const now = new Date();
    
    const notes: Note[] = [];
    if (applicationData.notes) {
        notes.push({
            id: `note-${Date.now()}`,
            applicationId: id,
            text: applicationData.notes,
            createdAt: now,
        });
    }

    const newApplication: Application = {
        ...applicationData,
        id,
        notes,
        tags: [],
        events: [
            { id: `event-${Date.now()}`, applicationId: id, type: 'applied', occurredAt: applicationData.appliedAt }
        ],
        createdAt: now,
        updatedAt: now,
    };

    const newApplications = [...applications, newApplication];
    setStoredApplications(newApplications);
    return newApplication;
}
