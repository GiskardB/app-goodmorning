import { openDB } from 'idb';

const DB_NAME = 'fitness-app-db';
const DB_VERSION = 2;

let dbPromise = null;

export async function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Progress store - tracks completed days
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('day', 'day', { unique: true });
      }

      // Settings store - user preferences
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // History store - workout sessions history (added in v2)
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('completedAt', 'completedAt', { unique: false });
      }
    }
  });

  return dbPromise;
}

// Progress functions
export async function getCompletedDays() {
  const db = await initDB();
  const all = await db.getAll('progress');
  return all.map(item => item.day);
}

export async function markDayCompleted(day) {
  const db = await initDB();
  await db.put('progress', {
    id: `day-${day}`,
    day: day,
    completedAt: new Date().toISOString()
  });
}

export async function isDayCompleted(day) {
  const db = await initDB();
  const result = await db.get('progress', `day-${day}`);
  return !!result;
}

export async function resetProgress() {
  const db = await initDB();
  await db.clear('progress');
}

// Settings functions
export async function getSetting(key) {
  const db = await initDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key, value) {
  const db = await initDB();
  await db.put('settings', { key, value });
}

export async function getCurrentDay() {
  const value = await getSetting('currentDay');
  return value || 1;
}

export async function setCurrentDay(day) {
  await setSetting('currentDay', day);
}

// History functions
export async function addWorkoutHistory(day, duration, workoutTitle, exerciseDetails) {
  const db = await initDB();
  await db.add('history', {
    day,
    duration,
    workoutTitle,
    exerciseDetails, // { warmup: [...], workout: [...], cooldown: [...] }
    completedAt: new Date().toISOString()
  });
}

export async function getWorkoutHistory(limit = 10) {
  const db = await initDB();
  const all = await db.getAll('history');
  // Sort by completedAt descending and limit
  return all
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, limit);
}

// Export all data for backup
export async function exportData() {
  const db = await initDB();
  const progress = await db.getAll('progress');
  const settings = await db.getAll('settings');

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
    settings
  };
}

// Import data from backup
export async function importData(data) {
  const db = await initDB();

  // Clear existing data
  await db.clear('progress');
  await db.clear('settings');

  // Import progress
  for (const item of data.progress || []) {
    await db.put('progress', item);
  }

  // Import settings
  for (const item of data.settings || []) {
    await db.put('settings', item);
  }
}
