/**
 * History fact providers for the rules engine
 * These functions provide historical training data as facts for rule evaluation
 */

import { daysSince, average, analyzeTrend } from '../../utils/calculations';

/**
 * Creates a fact provider for session history data
 * @param {Array} sessions - Array of past workout sessions
 * @param {number} lookbackDays - Number of days to look back (default 14)
 * @returns {Object} Fact definitions for the rules engine
 */
export function createHistoryFacts(sessions = [], lookbackDays = 14) {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

  // Filter sessions within lookback period
  const recentSessions = sessions.filter(s => new Date(s.date) >= cutoffDate);

  // Sort by date descending
  const sortedSessions = [...recentSessions].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Extract arrays of metrics
  const rpes = sortedSessions.map(s => s.postWorkout?.rpe).filter(v => v !== null && v !== undefined);
  const completions = sortedSessions.map(s => s.postWorkout?.completion).filter(v => v !== null && v !== undefined);
  const readinessScores = sortedSessions.map(s => s.preWorkout?.readinessScore).filter(v => v !== null && v !== undefined);
  const enjoyments = sortedSessions.map(s => s.postWorkout?.enjoyment).filter(v => v !== null && v !== undefined);

  // Calculate streaks
  const streak = calculateStreak(sessions);
  const missedDays = calculateMissedDays(sessions);

  // Pain tracking
  const sessionsWithPain = sortedSessions.filter(s => s.postWorkout?.pain);
  const painAreas = sessionsWithPain.flatMap(s => s.postWorkout?.painAreas || []);
  const uniquePainAreas = [...new Set(painAreas)];

  // Last session data
  const lastSession = sortedSessions[0];
  const lastSessionDate = lastSession?.date;
  const daysSinceLastSession = lastSessionDate ? daysSince(lastSessionDate) : null;

  return {
    // Session counts
    totalSessions: sessions.length,
    recentSessionCount: recentSessions.length,
    sessionsThisWeek: countSessionsInDays(sessions, 7),
    sessionsThisMonth: countSessionsInDays(sessions, 30),

    // Last session info
    hasSessionHistory: sessions.length > 0,
    lastSessionDate,
    daysSinceLastSession,
    lastSessionRpe: lastSession?.postWorkout?.rpe,
    lastSessionCompletion: lastSession?.postWorkout?.completion,
    lastReadinessScore: lastSession?.preWorkout?.readinessScore,

    // Streaks and consistency
    currentStreak: streak,
    missedDaysThisWeek: missedDays.thisWeek,
    missedDaysThisMonth: missedDays.thisMonth,
    isOnStreak: streak >= 3,
    hasLongStreak: streak >= 7,
    streakBroken: daysSinceLastSession !== null && daysSinceLastSession > 2,

    // RPE analysis
    recentRpes: rpes,
    averageRpe: average(rpes),
    rpesTrend: analyzeTrend(rpes),
    hasConsistentlyHighRpe: rpes.length >= 3 && rpes.slice(0, 3).every(r => r >= 8),
    hasConsistentlyLowRpe: rpes.length >= 3 && rpes.slice(0, 3).every(r => r <= 5),

    // Completion analysis
    recentCompletions: completions,
    averageCompletion: average(completions),
    completionTrend: analyzeTrend(completions),
    hasLowCompletionRate: completions.length >= 3 && average(completions.slice(0, 3)) < 70,
    hasHighCompletionRate: completions.length >= 3 && average(completions.slice(0, 3)) >= 90,

    // Readiness analysis
    recentReadinessScores: readinessScores,
    averageReadiness: average(readinessScores),
    readinessTrend: analyzeTrend(readinessScores),

    // Enjoyment analysis
    recentEnjoyments: enjoyments,
    averageEnjoyment: average(enjoyments),
    enjoymentTrend: analyzeTrend(enjoyments),
    hasLowEnjoyment: enjoyments.length >= 3 && average(enjoyments.slice(0, 3)) < 3,

    // Pain history
    recentPainCount: sessionsWithPain.length,
    hasPainHistory: sessionsWithPain.length > 0,
    hasRecurringPain: sessionsWithPain.length >= 2,
    frequentPainAreas: uniquePainAreas,
    painFrequency: recentSessions.length > 0 ? sessionsWithPain.length / recentSessions.length : 0,

    // Progression indicators
    shouldConsiderProgression: rpes.length >= 3 &&
      average(rpes.slice(0, 3)) <= 6 &&
      average(completions.slice(0, 3)) >= 85,
    shouldConsiderRegression: rpes.length >= 2 &&
      (average(rpes.slice(0, 2)) >= 9 || average(completions.slice(0, 2)) < 60),
    isPerformingWell: rpes.length >= 3 &&
      average(rpes.slice(0, 3)) >= 5 &&
      average(rpes.slice(0, 3)) <= 7 &&
      average(completions.slice(0, 3)) >= 80,

    // Anti-pattern indicators
    showsOvertrainingSign: rpes.length >= 3 &&
      average(rpes.slice(0, 3)) >= 8 &&
      analyzeTrend(completions) === 'decreasing',
    showsUndertrainingSign: rpes.length >= 3 &&
      average(rpes.slice(0, 3)) <= 4 &&
      sortedSessions.every(s => s.postWorkout?.couldDoMore),
    showsMotivationIssue: enjoyments.length >= 3 &&
      analyzeTrend(enjoyments) === 'decreasing' &&
      average(enjoyments.slice(0, 3)) < 3,
    showsInconsistency: missedDays.thisWeek >= 3 || (sessions.length > 0 && streak < 2 && daysSinceLastSession > 3)
  };
}

/**
 * Calculates the current training streak
 */
function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) return 0;

  const sortedDates = sessions
    .map(s => new Date(s.date).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i) // unique dates
    .sort((a, b) => new Date(b) - new Date(a));

  if (sortedDates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if last session was today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates missed training days
 */
function calculateMissedDays(sessions) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sessionsThisWeek = countSessionsInDays(sessions, 7);
  const sessionsThisMonth = countSessionsInDays(sessions, 30);

  // Assuming target is 4 sessions per week
  const targetPerWeek = 4;
  const targetPerMonth = 16;

  return {
    thisWeek: Math.max(0, targetPerWeek - sessionsThisWeek),
    thisMonth: Math.max(0, targetPerMonth - sessionsThisMonth)
  };
}

/**
 * Counts sessions within a number of days
 */
function countSessionsInDays(sessions, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return sessions.filter(s => new Date(s.date) >= cutoff).length;
}

/**
 * Creates aggregated facts from multiple sources
 * @param {Object} userProfile - User profile data
 * @param {Object} assessment - Current assessment data
 * @param {Object} feedback - Current feedback data
 * @param {Array} sessions - Session history
 * @returns {Object} Combined facts object
 */
export function createAggregatedFacts(userProfile, assessment, feedback, sessions) {
  const { createUserFacts, createAssessmentFacts, createFeedbackFacts } = require('./userFacts');

  return {
    user: createUserFacts(userProfile),
    assessment: createAssessmentFacts(assessment),
    feedback: createFeedbackFacts(feedback),
    history: createHistoryFacts(sessions),

    // Timestamp facts
    currentTime: new Date().toISOString(),
    currentHour: new Date().getHours(),
    currentDayOfWeek: new Date().getDay(),
    isWeekend: [0, 6].includes(new Date().getDay()),
    isMorning: new Date().getHours() >= 5 && new Date().getHours() < 12,
    isAfternoon: new Date().getHours() >= 12 && new Date().getHours() < 17,
    isEvening: new Date().getHours() >= 17 && new Date().getHours() < 21
  };
}
