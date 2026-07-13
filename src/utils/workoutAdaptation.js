import { getReadinessLevel } from './calculations';

// Impostazioni di adattamento per zona di readiness (vedi READINESS_THRESHOLDS):
// - low (0-40): riduci durate e sostituisci gli esercizi troppo difficili
// - medium (41-70): workout standard, nessun adattamento
// - high (71-100): aumenta leggermente le durate
const ADAPTATION_SETTINGS = {
  low: {
    durationFactor: 0.7,
    maxDifficulty: 2,
    label: 'Alleggerito',
    icon: '🌤️',
    description: 'Readiness bassa: durate ridotte ed esercizi difficili sostituiti con varianti più facili'
  },
  high: {
    durationFactor: 1.1,
    maxDifficulty: 5,
    label: 'Intensificato',
    icon: '🔥',
    description: 'Readiness alta: durate leggermente aumentate per spingere di più'
  }
};

const MIN_DURATION = 15;

function roundDuration(seconds) {
  return Math.max(MIN_DURATION, Math.round(seconds / 5) * 5);
}

function muscleSet(muscles) {
  return new Set(
    (muscles || '')
      .toLowerCase()
      .split(',')
      .map(m => m.trim())
      .filter(Boolean)
  );
}

function sharedMuscleCount(a, b) {
  const setA = muscleSet(a);
  let count = 0;
  muscleSet(b).forEach(m => { if (setA.has(m)) count++; });
  return count;
}

/**
 * Find an easier replacement for an exercise: same type, difficulty within
 * the cap, preferring alternatives that target the same muscles and are
 * closest to the cap (to avoid over-easing the workout).
 */
function findEasierAlternative(exercise, allExercises, maxDifficulty, usedKeys) {
  let best = null;
  let bestScore = -1;

  Object.entries(allExercises).forEach(([key, candidate]) => {
    if (usedKeys.has(key)) return;
    if (candidate.type !== exercise.type) return;
    const difficulty = candidate.difficulty || 3;
    if (difficulty > maxDifficulty) return;

    const score = sharedMuscleCount(exercise.muscles, candidate.muscles) * 10 + difficulty;
    if (score > bestScore) {
      bestScore = score;
      best = { key, exercise: candidate };
    }
  });

  return best;
}

/**
 * Adapt a day's workout to the user's readiness score using exercise
 * difficulty weights (1-5). Returns null when no adaptation is needed.
 *
 * @param {Array} workoutExercises - Enriched exercises of the day ({ exercise_id, duration, difficulty, ... })
 * @param {Object} allExercises - Full exercise registry keyed by exercise_id
 * @param {number} readinessScore - Score 0-100 from the pre-workout check-in
 * @returns {null|{level, label, icon, description, durationFactor, exercises, changes}}
 */
export function adaptWorkoutToReadiness(workoutExercises, allExercises, readinessScore) {
  if (readinessScore == null || !Array.isArray(workoutExercises) || workoutExercises.length === 0) {
    return null;
  }

  const level = getReadinessLevel(readinessScore);
  const settings = ADAPTATION_SETTINGS[level];
  if (!settings) return null; // zona media: workout standard

  const usedKeys = new Set(workoutExercises.map(ex => ex.exercise_id));
  const changes = [];

  const exercises = workoutExercises.map(ex => {
    let adapted = { ...ex, duration: roundDuration((ex.duration || 40) * settings.durationFactor) };

    const difficulty = ex.difficulty || 3;
    if (difficulty > settings.maxDifficulty && allExercises) {
      const alternative = findEasierAlternative(ex, allExercises, settings.maxDifficulty, usedKeys);
      if (alternative) {
        usedKeys.add(alternative.key);
        changes.push({ from: ex.name, to: alternative.exercise.name });
        adapted = {
          ...alternative.exercise,
          exercise_id: alternative.key,
          duration: adapted.duration
        };
      }
    }

    return adapted;
  });

  return {
    level,
    label: settings.label,
    icon: settings.icon,
    description: settings.description,
    durationFactor: settings.durationFactor,
    exercises,
    changes
  };
}

export default adaptWorkoutToReadiness;
