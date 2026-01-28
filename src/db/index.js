import { openDB } from 'idb';

const DB_NAME = 'fitness-app-db';
const DB_VERSION = 4;

let dbPromise = null;

// Global activeProfileId cache (to avoid async calls everywhere)
let cachedActiveProfileId = null;

export async function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // v4: Complete rebuild with profile isolation
      // Delete old stores if upgrading from v3 or earlier
      if (oldVersion < 4) {
        // Clear old stores
        const storesToDelete = ['progress', 'settings', 'history', 'sessions', 'painEvents', 'antiPatterns'];
        for (const storeName of storesToDelete) {
          if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
          }
        }
      }

      // User Profile store - keeps profile data
      if (!db.objectStoreNames.contains('userProfile')) {
        db.createObjectStore('userProfile', { keyPath: 'id' });
      }

      // Global settings (only activeProfileId lives here)
      if (!db.objectStoreNames.contains('globalSettings')) {
        db.createObjectStore('globalSettings', { keyPath: 'key' });
      }

      // Progress store - tracks completed days per profile
      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('profileId', 'profileId', { unique: false });
      }

      // Profile Settings store - user preferences per profile
      if (!db.objectStoreNames.contains('profileSettings')) {
        const settingsStore = db.createObjectStore('profileSettings', { keyPath: 'id' });
        settingsStore.createIndex('profileId', 'profileId', { unique: false });
      }

      // History store - workout sessions history per profile
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('profileId', 'profileId', { unique: false });
        historyStore.createIndex('completedAt', 'completedAt', { unique: false });
      }

      // Sessions store - detailed workout sessions per profile
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
        sessionsStore.createIndex('profileId', 'profileId', { unique: false });
        sessionsStore.createIndex('date', 'date', { unique: false });
        sessionsStore.createIndex('day', 'day', { unique: false });
      }

      // Pain Events store - track pain occurrences per profile
      if (!db.objectStoreNames.contains('painEvents')) {
        const painStore = db.createObjectStore('painEvents', { keyPath: 'id', autoIncrement: true });
        painStore.createIndex('profileId', 'profileId', { unique: false });
        painStore.createIndex('date', 'date', { unique: false });
        painStore.createIndex('area', 'area', { unique: false });
      }

      // Anti-Patterns store - detected negative patterns per profile
      if (!db.objectStoreNames.contains('antiPatterns')) {
        const antiPatternStore = db.createObjectStore('antiPatterns', { keyPath: 'id', autoIncrement: true });
        antiPatternStore.createIndex('profileId', 'profileId', { unique: false });
        antiPatternStore.createIndex('type', 'type', { unique: false });
        antiPatternStore.createIndex('detectedAt', 'detectedAt', { unique: false });
      }
    }
  });

  return dbPromise;
}

// ============ Global Settings (activeProfileId only) ============

export async function getActiveProfileId() {
  if (cachedActiveProfileId) return cachedActiveProfileId;
  const db = await initDB();
  const result = await db.get('globalSettings', 'activeProfileId');
  cachedActiveProfileId = result?.value || 'main';
  return cachedActiveProfileId;
}

export async function setActiveProfileId(profileId) {
  const db = await initDB();
  await db.put('globalSettings', { key: 'activeProfileId', value: profileId });
  cachedActiveProfileId = profileId;
}

// ============ Progress functions (profile-specific) ============

export async function getCompletedDays() {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('progress', 'profileId', profileId);
  return all.map(item => item.day);
}

export async function markDayCompleted(day) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  await db.put('progress', {
    id: `${profileId}-day-${day}`,
    profileId,
    day: day,
    completedAt: new Date().toISOString()
  });
}

export async function isDayCompleted(day) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const result = await db.get('progress', `${profileId}-day-${day}`);
  return !!result;
}

export async function resetProgress() {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('progress', 'profileId', profileId);
  for (const item of all) {
    await db.delete('progress', item.id);
  }
}

// ============ Profile Settings functions (profile-specific) ============

export async function getSetting(key) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const result = await db.get('profileSettings', `${profileId}-${key}`);
  return result?.value;
}

export async function setSetting(key, value) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  await db.put('profileSettings', {
    id: `${profileId}-${key}`,
    profileId,
    key,
    value
  });
}

export async function getCurrentDay() {
  const value = await getSetting('currentDay');
  return value || 1;
}

export async function setCurrentDay(day) {
  await setSetting('currentDay', day);
}

// ============ History functions (profile-specific) ============

export async function addWorkoutHistory(day, duration, workoutTitle, exerciseDetails) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  await db.add('history', {
    profileId,
    day,
    duration,
    workoutTitle,
    exerciseDetails,
    completedAt: new Date().toISOString()
  });
}

export async function getWorkoutHistory(limit = 10) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('history', 'profileId', profileId);
  return all
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, limit);
}

// ============ User Profile Functions ============

export async function getUserProfile() {
  const db = await initDB();
  const activeId = await getActiveProfileId();
  const profile = await db.get('userProfile', activeId);
  return profile || null;
}

export async function getAllProfiles() {
  const db = await initDB();
  const profiles = await db.getAll('userProfile');
  return profiles.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

export async function getProfileById(profileId) {
  const db = await initDB();
  return await db.get('userProfile', profileId);
}

export async function saveUserProfile(profileData) {
  const db = await initDB();
  const activeId = await getActiveProfileId();
  await db.put('userProfile', {
    id: activeId,
    ...profileData,
    updatedAt: new Date().toISOString()
  });
}

export async function createProfile(profileData, setAsActive = true) {
  const db = await initDB();
  const newId = `profile_${Date.now()}`;
  await db.put('userProfile', {
    id: newId,
    ...profileData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  if (setAsActive) {
    await setActiveProfileId(newId);
  }
  return newId;
}

export async function switchProfile(profileId) {
  const db = await initDB();
  const profile = await db.get('userProfile', profileId);
  if (profile) {
    await setActiveProfileId(profileId);
    return profile;
  }
  return null;
}

export async function deleteProfile(profileId) {
  const db = await initDB();
  const activeId = await getActiveProfileId();
  if (profileId === activeId) {
    throw new Error('Cannot delete the active profile');
  }

  // Delete profile
  await db.delete('userProfile', profileId);

  // Delete all profile-specific data
  // Progress
  const progress = await db.getAllFromIndex('progress', 'profileId', profileId);
  for (const item of progress) {
    await db.delete('progress', item.id);
  }

  // Profile Settings
  const settings = await db.getAllFromIndex('profileSettings', 'profileId', profileId);
  for (const item of settings) {
    await db.delete('profileSettings', item.id);
  }

  // History
  const history = await db.getAllFromIndex('history', 'profileId', profileId);
  for (const item of history) {
    await db.delete('history', item.id);
  }

  // Sessions
  const sessions = await db.getAllFromIndex('sessions', 'profileId', profileId);
  for (const item of sessions) {
    await db.delete('sessions', item.id);
  }

  // Pain Events
  const painEvents = await db.getAllFromIndex('painEvents', 'profileId', profileId);
  for (const item of painEvents) {
    await db.delete('painEvents', item.id);
  }

  // Anti-Patterns
  const antiPatterns = await db.getAllFromIndex('antiPatterns', 'profileId', profileId);
  for (const item of antiPatterns) {
    await db.delete('antiPatterns', item.id);
  }
}

export async function isOnboardingCompleted() {
  const profile = await getUserProfile();
  return profile?.onboardingCompleted === true;
}

export async function resetOnboarding() {
  const db = await initDB();
  const activeId = await getActiveProfileId();
  await db.delete('userProfile', activeId);
}

// ============ Sessions Functions (profile-specific) ============

export async function saveSession(sessionData) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const id = await db.add('sessions', {
    ...sessionData,
    profileId,
    date: new Date().toISOString()
  });
  return id;
}

export async function getSession(id) {
  const db = await initDB();
  return await db.get('sessions', id);
}

export async function getSessions(limit = 20) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('sessions', 'profileId', profileId);
  return all
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export async function getSessionsByDay(day) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('sessions', 'profileId', profileId);
  return all.filter(s => s.day === day);
}

export async function getRecentSessions(days = 7) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('sessions', 'profileId', profileId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return all
    .filter(s => new Date(s.date) >= cutoff)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ============ Pain Events Functions (profile-specific) ============

export async function addPainEvent(painData) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  return await db.add('painEvents', {
    ...painData,
    profileId,
    date: new Date().toISOString()
  });
}

export async function getPainEvents(limit = 50) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('painEvents', 'profileId', profileId);
  return all
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export async function getPainEventsByArea(area) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('painEvents', 'profileId', profileId);
  return all.filter(p => p.area === area);
}

export async function getRecentPainEvents(days = 14) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('painEvents', 'profileId', profileId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return all.filter(p => new Date(p.date) >= cutoff);
}

// ============ Anti-Pattern Functions (profile-specific) ============

export async function addAntiPattern(patternData) {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  return await db.add('antiPatterns', {
    ...patternData,
    profileId,
    detectedAt: new Date().toISOString(),
    resolved: false
  });
}

export async function getAntiPatterns() {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('antiPatterns', 'profileId', profileId);
  return all.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
}

export async function getActiveAntiPatterns() {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const all = await db.getAllFromIndex('antiPatterns', 'profileId', profileId);
  return all.filter(p => !p.resolved);
}

export async function resolveAntiPattern(id) {
  const db = await initDB();
  const pattern = await db.get('antiPatterns', id);
  if (pattern) {
    pattern.resolved = true;
    pattern.resolvedAt = new Date().toISOString();
    await db.put('antiPatterns', pattern);
  }
}

// ============ Statistics Functions (profile-specific) ============

export async function getTrainingStats() {
  const db = await initDB();
  const profileId = await getActiveProfileId();
  const sessions = await db.getAllFromIndex('sessions', 'profileId', profileId);
  const painEvents = await db.getAllFromIndex('painEvents', 'profileId', profileId);

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageRPE: 0,
      averageCompletion: 0,
      averageReadiness: 0,
      totalPainEvents: 0,
      streak: 0
    };
  }

  const totalSessions = sessions.length;
  const averageRPE = sessions.reduce((sum, s) => sum + (s.postWorkout?.rpe || 0), 0) / totalSessions;
  const averageCompletion = sessions.reduce((sum, s) => sum + (s.postWorkout?.completion || 100), 0) / totalSessions;
  const averageReadiness = sessions.reduce((sum, s) => sum + (s.preWorkout?.readinessScore || 70), 0) / totalSessions;

  // Calculate streak
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }

  return {
    totalSessions,
    averageRPE: Math.round(averageRPE * 10) / 10,
    averageCompletion: Math.round(averageCompletion),
    averageReadiness: Math.round(averageReadiness),
    totalPainEvents: painEvents.length,
    streak
  };
}

// ============ Export/Import Functions ============

export async function exportData() {
  const db = await initDB();
  const globalSettings = await db.getAll('globalSettings');
  const userProfile = await db.getAll('userProfile');
  const progress = await db.getAll('progress');
  const profileSettings = await db.getAll('profileSettings');
  const history = await db.getAll('history');
  const sessions = await db.getAll('sessions');
  const painEvents = await db.getAll('painEvents');
  const antiPatterns = await db.getAll('antiPatterns');

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    globalSettings,
    userProfile,
    progress,
    profileSettings,
    history,
    sessions,
    painEvents,
    antiPatterns
  };
}

export async function importData(data) {
  const db = await initDB();

  // Clear all existing data
  await db.clear('globalSettings');
  await db.clear('userProfile');
  await db.clear('progress');
  await db.clear('profileSettings');
  await db.clear('history');
  await db.clear('sessions');
  await db.clear('painEvents');
  await db.clear('antiPatterns');

  // Import all data
  for (const item of data.globalSettings || []) {
    await db.put('globalSettings', item);
  }

  for (const item of data.userProfile || []) {
    await db.put('userProfile', item);
  }

  for (const item of data.progress || []) {
    await db.put('progress', item);
  }

  for (const item of data.profileSettings || []) {
    await db.put('profileSettings', item);
  }

  for (const item of data.history || []) {
    await db.put('history', item);
  }

  for (const item of data.sessions || []) {
    await db.put('sessions', item);
  }

  for (const item of data.painEvents || []) {
    await db.put('painEvents', item);
  }

  for (const item of data.antiPatterns || []) {
    await db.put('antiPatterns', item);
  }

  // Reset cached profile ID
  cachedActiveProfileId = null;
}
