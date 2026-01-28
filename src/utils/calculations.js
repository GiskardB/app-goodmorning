import {
  READINESS_WEIGHTS,
  READINESS_THRESHOLDS,
  MENSTRUAL_PHASE_MODIFIERS,
  BMI_CATEGORIES,
  AGE_CATEGORIES,
  GENDERS,
  PROGRESSION_ACTIONS
} from './constants';

/**
 * Calculate age from birth date
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate BMI from weight and height
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BMI value
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category from BMI value
 * @param {number} bmi - BMI value
 * @returns {object} BMI category with label and color
 */
export function getBMICategory(bmi) {
  if (bmi < BMI_CATEGORIES.UNDERWEIGHT.max) return BMI_CATEGORIES.UNDERWEIGHT;
  if (bmi < BMI_CATEGORIES.NORMAL.max) return BMI_CATEGORIES.NORMAL;
  if (bmi < BMI_CATEGORIES.OVERWEIGHT.max) return BMI_CATEGORIES.OVERWEIGHT;
  return BMI_CATEGORIES.OBESE;
}

/**
 * Get age category from age
 * @param {number} age - Age in years
 * @returns {object} Age category with recovery multiplier
 */
export function getAgeCategory(age) {
  if (age < AGE_CATEGORIES.YOUNG.max) return AGE_CATEGORIES.YOUNG;
  if (age < AGE_CATEGORIES.ADULT.max) return AGE_CATEGORIES.ADULT;
  if (age < AGE_CATEGORIES.MATURE.max) return AGE_CATEGORIES.MATURE;
  return AGE_CATEGORIES.SENIOR;
}

/**
 * Calculate readiness score from pre-workout assessment
 * @param {object} assessment - Pre-workout assessment data
 * @param {object} userProfile - User profile data
 * @returns {number} Readiness score (0-100)
 */
export function calculateReadinessScore(assessment, userProfile = {}) {
  const {
    energy = 3,
    doms = 3,
    stress = 3,
    motivation = 3,
    menstrualPhase = null,
    hydration = true,
    fasting = false
  } = assessment;

  const isFemale = userProfile.gender === GENDERS.FEMALE;

  // Normalize values to 0-100 scale (inputs are 1-5)
  const normalizedEnergy = (energy / 5) * 100;
  const normalizedDoms = ((6 - doms) / 5) * 100; // Inverse: higher DOMS = lower score
  const normalizedStress = ((6 - stress) / 5) * 100; // Inverse: higher stress = lower score
  const normalizedMotivation = (motivation / 5) * 100;

  let weights = { ...READINESS_WEIGHTS };

  // If not female or no menstrual phase, redistribute weight
  if (!isFemale || !menstrualPhase) {
    const redistributedWeight = weights.menstrualPhase / 4;
    weights.energy += redistributedWeight;
    weights.doms += redistributedWeight;
    weights.stress += redistributedWeight;
    weights.motivation += redistributedWeight;
    weights.menstrualPhase = 0;
  }

  // Calculate weighted score
  let score =
    normalizedEnergy * weights.energy +
    normalizedDoms * weights.doms +
    normalizedStress * weights.stress +
    normalizedMotivation * weights.motivation;

  // Apply menstrual phase modifier if applicable
  if (isFemale && menstrualPhase && MENSTRUAL_PHASE_MODIFIERS[menstrualPhase]) {
    const phaseModifier = MENSTRUAL_PHASE_MODIFIERS[menstrualPhase];
    score *= phaseModifier;
  }

  // Apply hydration/fasting modifiers
  if (!hydration) score *= 0.95;
  if (fasting) score *= 0.90;

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Get readiness level from score
 * @param {number} score - Readiness score (0-100)
 * @returns {string} Readiness level: 'low', 'medium', 'high'
 */
export function getReadinessLevel(score) {
  if (score <= READINESS_THRESHOLDS.LOW) return 'low';
  if (score <= READINESS_THRESHOLDS.MEDIUM) return 'medium';
  return 'high';
}

/**
 * Calculate progression decision based on RPE and completion
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 * @param {number} completion - Workout completion percentage (0-100)
 * @param {object} history - Recent workout history
 * @returns {object} Progression decision with action and reason
 */
export function calculateProgressionDecision(rpe, completion, history = {}) {
  const {
    recentSessions = [],
    painReported = false,
    consecutiveHighRPE = 0
  } = history;

  // If pain was reported, always recommend decrease or rest
  if (painReported) {
    return {
      action: PROGRESSION_ACTIONS.DECREASE,
      reason: 'Dolore riportato - riduci intensità per recuperare',
      confidence: 0.9
    };
  }

  // Check for overtraining (consecutive high RPE sessions)
  if (consecutiveHighRPE >= 3) {
    return {
      action: PROGRESSION_ACTIONS.REST,
      reason: 'RPE alto per 3+ sessioni consecutive - riposo consigliato',
      confidence: 0.85
    };
  }

  // RPE x Completion Matrix
  // Low RPE (1-4) + High Completion (80-100) = Can increase
  // High RPE (7-10) + Low Completion (<60) = Must decrease
  // Everything else = Maintain

  if (rpe <= 4 && completion >= 80) {
    return {
      action: PROGRESSION_ACTIONS.INCREASE,
      reason: 'Ottimo lavoro! Pronto per aumentare la difficoltà',
      confidence: 0.8
    };
  }

  if (rpe <= 5 && completion >= 90) {
    return {
      action: PROGRESSION_ACTIONS.INCREASE,
      reason: 'Completamento eccellente, puoi spingerti di più',
      confidence: 0.7
    };
  }

  if (rpe >= 8 && completion < 60) {
    return {
      action: PROGRESSION_ACTIONS.DECREASE,
      reason: 'Allenamento troppo intenso - riduci per la prossima sessione',
      confidence: 0.85
    };
  }

  if (rpe >= 7 && completion < 70) {
    return {
      action: PROGRESSION_ACTIONS.DECREASE,
      reason: 'Difficoltà elevata - considera una riduzione',
      confidence: 0.7
    };
  }

  // Default: maintain current level
  return {
    action: PROGRESSION_ACTIONS.MAINTAIN,
    reason: 'Buon equilibrio tra sforzo e completamento',
    confidence: 0.75
  };
}

/**
 * Calculate days since a date
 * @param {string|Date} date - The date to compare
 * @returns {number} Number of days since the date
 */
export function daysSince(date) {
  const then = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - then);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate average of an array
 * @param {number[]} arr - Array of numbers
 * @returns {number} Average value
 */
export function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Analyze trend direction from array of values
 * @param {number[]} values - Array of values (oldest to newest)
 * @returns {string} Trend direction: 'up', 'down', 'stable'
 */
export function analyzeTrend(values) {
  if (!values || values.length < 3) return 'stable';

  // Calculate simple moving average difference
  const recentAvg = average(values.slice(-3));
  const olderAvg = average(values.slice(0, 3));
  const diff = recentAvg - olderAvg;
  const threshold = olderAvg * 0.1; // 10% change threshold

  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

/**
 * Calculate recovery time based on RPE and user age
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 * @param {number} age - User age
 * @returns {number} Recommended recovery hours
 */
export function calculateRecoveryTime(rpe, age) {
  const ageCategory = getAgeCategory(age);
  const baseRecovery = 24; // Base 24 hours

  // Higher RPE needs more recovery
  const rpeMultiplier = 1 + (rpe - 5) * 0.1; // 5 is neutral

  return Math.round(baseRecovery * rpeMultiplier * ageCategory.recoveryMultiplier);
}

/**
 * Estimate calories burned based on workout duration and intensity
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 * @param {number} weightKg - User weight in kg
 * @returns {number} Estimated calories burned
 */
export function estimateCaloriesBurned(durationMinutes, rpe, weightKg) {
  // MET approximation based on RPE
  // RPE 1-3: Light (MET ~3)
  // RPE 4-6: Moderate (MET ~5)
  // RPE 7-8: Vigorous (MET ~7)
  // RPE 9-10: Very vigorous (MET ~9)
  let met;
  if (rpe <= 3) met = 3;
  else if (rpe <= 6) met = 5;
  else if (rpe <= 8) met = 7;
  else met = 9;

  // Calories = MET × weight(kg) × duration(hours)
  const hours = durationMinutes / 60;
  return Math.round(met * weightKg * hours);
}

/**
 * Calculate workout intensity modifier based on readiness
 * @param {number} readinessScore - Readiness score (0-100)
 * @returns {number} Intensity modifier (0.5-1.2)
 */
export function calculateIntensityModifier(readinessScore) {
  if (readinessScore < 30) return 0.5;  // Very low readiness: 50% intensity
  if (readinessScore < 50) return 0.7;  // Low readiness: 70% intensity
  if (readinessScore < 70) return 0.85; // Medium-low: 85% intensity
  if (readinessScore < 85) return 1.0;  // Normal: 100% intensity
  return 1.1; // High readiness: can push to 110%
}
