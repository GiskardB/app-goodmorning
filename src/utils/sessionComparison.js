/**
 * Session comparison utilities
 * Compare planned workout vs actual execution
 */

/**
 * Compare planned workout with executed workout
 * @param {object} planned - Planned workout data
 * @param {object} executed - Executed workout data
 * @returns {object} Comparison results
 */
export function compareWorkoutSession(planned, executed) {
  const comparison = {
    totalPlannedExercises: 0,
    totalCompletedExercises: 0,
    totalSkippedExercises: 0,
    totalPlannedDuration: 0,
    totalActualDuration: 0,
    completionRate: 0,
    phases: {
      warmup: { planned: 0, completed: 0, skipped: [] },
      workout: { planned: 0, completed: 0, skipped: [] },
      cooldown: { planned: 0, completed: 0, skipped: [] }
    },
    skippedExercises: [],
    durationDifference: 0
  };

  // Process each phase
  ['warmup', 'workout', 'cooldown'].forEach(phase => {
    const plannedExercises = planned[phase] || [];
    const completedExercises = executed[phase] || [];

    comparison.phases[phase].planned = plannedExercises.length;
    comparison.phases[phase].completed = completedExercises.length;
    comparison.totalPlannedExercises += plannedExercises.length;
    comparison.totalCompletedExercises += completedExercises.length;

    // Calculate planned duration for this phase
    const phasePlannedDuration = plannedExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    comparison.totalPlannedDuration += phasePlannedDuration;

    // Calculate actual duration for this phase
    const phaseActualDuration = completedExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    comparison.totalActualDuration += phaseActualDuration;

    // Find skipped exercises
    const completedNames = new Set(completedExercises.map(ex => ex.name || ex.exercise_id));
    plannedExercises.forEach(ex => {
      const name = ex.name || ex.exercise_id;
      if (!completedNames.has(name)) {
        comparison.phases[phase].skipped.push(name);
        comparison.skippedExercises.push({ phase, name, duration: ex.duration });
        comparison.totalSkippedExercises++;
      }
    });
  });

  // Calculate completion rate
  if (comparison.totalPlannedExercises > 0) {
    comparison.completionRate = Math.round(
      (comparison.totalCompletedExercises / comparison.totalPlannedExercises) * 100
    );
  }

  // Calculate duration difference
  comparison.durationDifference = comparison.totalActualDuration - comparison.totalPlannedDuration;

  return comparison;
}

/**
 * Analyze session performance
 * @param {object} session - Session data with pre/post workout info
 * @returns {object} Performance analysis
 */
export function analyzeSessionPerformance(session) {
  const analysis = {
    readinessVsPerformance: 'normal',
    effortLevel: 'appropriate',
    recommendations: [],
    alerts: []
  };

  const { preWorkout, postWorkout, comparison } = session;

  if (!preWorkout || !postWorkout) return analysis;

  const readinessScore = preWorkout.readinessScore || 70;
  const rpe = postWorkout.rpe || 5;
  const completion = postWorkout.completion || comparison?.completionRate || 100;

  // Analyze readiness vs performance
  if (readinessScore < 50 && rpe >= 7) {
    analysis.readinessVsPerformance = 'pushed_too_hard';
    analysis.alerts.push('Hai spinto molto nonostante una bassa prontezza');
    analysis.recommendations.push('Prossima volta ascolta di più il tuo corpo');
  } else if (readinessScore > 80 && rpe <= 4 && completion === 100) {
    analysis.readinessVsPerformance = 'could_push_more';
    analysis.recommendations.push('Eri in ottima forma, potresti aumentare l\'intensità');
  } else if (readinessScore > 70 && rpe >= 8) {
    analysis.readinessVsPerformance = 'optimal';
    analysis.recommendations.push('Ottimo bilanciamento tra prontezza e sforzo!');
  }

  // Analyze effort level
  if (rpe <= 3 && completion >= 90) {
    analysis.effortLevel = 'too_easy';
    analysis.recommendations.push('Considera di aumentare la difficoltà degli esercizi');
  } else if (rpe >= 9 && completion < 70) {
    analysis.effortLevel = 'too_hard';
    analysis.recommendations.push('Riduci l\'intensità per completare più esercizi');
    analysis.alerts.push('Completamento basso con sforzo massimo');
  } else if (rpe >= 6 && rpe <= 8 && completion >= 80) {
    analysis.effortLevel = 'optimal';
  }

  // Check for pain
  if (postWorkout.pain) {
    analysis.alerts.push('Dolore riportato durante l\'allenamento');
    analysis.recommendations.push('Monitora le zone doloranti e considera un riposo extra');
  }

  // Check technique confidence
  if (postWorkout.techniqueConfidence && postWorkout.techniqueConfidence <= 2) {
    analysis.recommendations.push('Rivedi la tecnica degli esercizi più difficili');
  }

  return analysis;
}

/**
 * Calculate streak and consistency metrics
 * @param {object[]} sessions - Array of session data
 * @returns {object} Consistency metrics
 */
export function calculateConsistencyMetrics(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSessionsPerWeek: 0,
      consistency: 0
    };
  }

  // Sort sessions by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const totalSessions = sessions.length;

  // Calculate streaks
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedSessions.length; i++) {
    const prevDate = new Date(sortedSessions[i - 1].date);
    const currDate = new Date(sortedSessions[i].date);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) { // Allow 1 day gap
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Check if current streak is still active
  const lastSession = new Date(sortedSessions[sortedSessions.length - 1].date);
  const now = new Date();
  const daysSinceLastSession = Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));

  currentStreak = daysSinceLastSession <= 2 ? tempStreak : 0;

  // Calculate average sessions per week
  if (sortedSessions.length >= 2) {
    const firstDate = new Date(sortedSessions[0].date);
    const lastDate = new Date(sortedSessions[sortedSessions.length - 1].date);
    const weeks = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 7));
    var averageSessionsPerWeek = Math.round((totalSessions / weeks) * 10) / 10;
  } else {
    var averageSessionsPerWeek = totalSessions;
  }

  // Calculate consistency score (0-100)
  // Based on regularity and streak
  const consistencyScore = Math.min(100, Math.round(
    (averageSessionsPerWeek / 5) * 50 + // Up to 50 points for frequency
    (currentStreak / 7) * 30 + // Up to 30 points for current streak
    (longestStreak / 14) * 20 // Up to 20 points for longest streak
  ));

  return {
    totalSessions,
    currentStreak,
    longestStreak,
    averageSessionsPerWeek,
    consistency: consistencyScore
  };
}

/**
 * Detect patterns in session data
 * @param {object[]} sessions - Array of session data
 * @returns {object[]} Detected patterns
 */
export function detectPatterns(sessions) {
  const patterns = [];

  if (!sessions || sessions.length < 5) return patterns;

  // Sort by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recentSessions = sortedSessions.slice(0, 7);

  // Check for high RPE streak
  const highRPECount = recentSessions.filter(
    s => s.postWorkout?.rpe >= 8
  ).length;

  if (highRPECount >= 3) {
    patterns.push({
      type: 'high_rpe_streak',
      severity: 'warning',
      message: `${highRPECount} sessioni recenti con RPE alto`,
      recommendation: 'Considera di ridurre l\'intensità per permettere il recupero'
    });
  }

  // Check for low completion trend
  const lowCompletionCount = recentSessions.filter(
    s => (s.postWorkout?.completion || 100) < 70
  ).length;

  if (lowCompletionCount >= 3) {
    patterns.push({
      type: 'low_completion',
      severity: 'warning',
      message: 'Completamento basso nelle sessioni recenti',
      recommendation: 'Gli allenamenti potrebbero essere troppo impegnativi'
    });
  }

  // Check for pain recurrence
  const painSessions = recentSessions.filter(s => s.postWorkout?.pain);
  if (painSessions.length >= 2) {
    patterns.push({
      type: 'recurring_pain',
      severity: 'alert',
      message: 'Dolore riportato in più sessioni recenti',
      recommendation: 'Consulta un professionista se il dolore persiste'
    });
  }

  // Check for low motivation trend
  const lowMotivationCount = recentSessions.filter(
    s => s.preWorkout?.motivation <= 2
  ).length;

  if (lowMotivationCount >= 3) {
    patterns.push({
      type: 'low_motivation',
      severity: 'info',
      message: 'Motivazione bassa nelle sessioni recenti',
      recommendation: 'Prova a variare gli allenamenti o gli orari'
    });
  }

  // Check for improving trend (positive pattern)
  const rpeValues = recentSessions
    .filter(s => s.postWorkout?.rpe)
    .map(s => s.postWorkout.rpe);

  if (rpeValues.length >= 5) {
    const recentAvg = rpeValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = rpeValues.slice(-3).reduce((a, b) => a + b, 0) / 3;

    if (recentAvg < olderAvg - 1) {
      patterns.push({
        type: 'improving_efficiency',
        severity: 'positive',
        message: 'Stai diventando più efficiente!',
        recommendation: 'Ottimo progresso, continua così'
      });
    }
  }

  return patterns;
}
