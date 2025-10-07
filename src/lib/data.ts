import type { Application } from './types';

// This file is no longer the primary source of data, but can be kept for reference 
// or for seeding a new database instance if needed.
// The primary data source is now Firestore, managed via src/lib/storage.ts.

const today = new Date();
const subtractDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const applications: Application[] = [];
