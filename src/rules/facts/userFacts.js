/**
 * User fact providers for the rules engine
 * These functions provide user-related data as facts for rule evaluation
 */

import { calculateAge, calculateBMI, getBMICategory, getAgeCategory } from '../../utils/calculations';

/**
 * Creates a fact provider for user profile data
 * @param {Object} userProfile - The user's profile data
 * @returns {Object} Fact definitions for the rules engine
 */
export function createUserFacts(userProfile) {
  if (!userProfile) {
    return {
      hasProfile: false,
      age: null,
      gender: null,
      weight: null,
      height: null,
      bmi: null,
      bmiCategory: null,
      ageCategory: null,
      goal: null,
      experience: null,
      conditions: [],
      isFemale: false,
      isBeginner: false,
      isIntermediate: false,
      isAdvanced: false,
      hasMedicalConditions: false
    };
  }

  const age = userProfile.birthDate ? calculateAge(userProfile.birthDate) : null;
  const bmi = calculateBMI(userProfile.weight, userProfile.height);
  const bmiCategory = getBMICategory(bmi);
  const ageCategory = getAgeCategory(age);

  return {
    // Basic profile info
    hasProfile: true,
    name: userProfile.name,
    age,
    gender: userProfile.gender,
    weight: userProfile.weight,
    height: userProfile.height,

    // Calculated values
    bmi,
    bmiCategory: bmiCategory?.label,
    bmiCategoryKey: bmiCategory?.key,
    ageCategory: ageCategory?.label,
    ageCategoryKey: ageCategory?.key,

    // Training preferences
    goal: userProfile.goal,
    experience: userProfile.experience,
    conditions: userProfile.conditions || [],

    // Boolean flags for quick checks
    isFemale: userProfile.gender === 'female',
    isMale: userProfile.gender === 'male',
    isBeginner: userProfile.experience === 'beginner',
    isIntermediate: userProfile.experience === 'intermediate',
    isAdvanced: userProfile.experience === 'advanced',

    // Goal flags
    goalIsToning: userProfile.goal === 'toning',
    goalIsStrength: userProfile.goal === 'strength',
    goalIsEndurance: userProfile.goal === 'endurance',
    goalIsFlexibility: userProfile.goal === 'flexibility',

    // Medical conditions
    hasMedicalConditions: (userProfile.conditions || []).length > 0,
    hasBackProblems: (userProfile.conditions || []).includes('back_problems'),
    hasKneeProblems: (userProfile.conditions || []).includes('knee_problems'),
    hasShoulderProblems: (userProfile.conditions || []).includes('shoulder_problems'),
    hasHeartCondition: (userProfile.conditions || []).includes('heart_condition'),
    hasHighBloodPressure: (userProfile.conditions || []).includes('high_blood_pressure'),
    hasPregnancy: (userProfile.conditions || []).includes('pregnancy'),
    hasArthritis: (userProfile.conditions || []).includes('arthritis'),

    // Age-based flags
    isYoung: age !== null && age < 30,
    isAdult: age !== null && age >= 30 && age < 50,
    isMature: age !== null && age >= 50 && age < 65,
    isSenior: age !== null && age >= 65,

    // BMI-based flags
    isUnderweight: bmiCategory?.key === 'underweight',
    isNormalWeight: bmiCategory?.key === 'normal',
    isOverweight: bmiCategory?.key === 'overweight',
    isObese: bmiCategory?.key === 'obese',

    // Profile metadata
    profileCreatedAt: userProfile.createdAt,
    profileUpdatedAt: userProfile.updatedAt
  };
}

/**
 * Creates a fact provider for pre-workout assessment data
 * @param {Object} assessment - The pre-workout assessment data
 * @returns {Object} Fact definitions
 */
export function createAssessmentFacts(assessment) {
  if (!assessment) {
    return {
      hasAssessment: false,
      energy: 3,
      doms: 1,
      domsAreas: [],
      stress: 3,
      motivation: 3,
      availableTime: 30,
      hydration: true,
      fasting: false,
      menstrualPhase: null,
      readinessScore: null
    };
  }

  return {
    hasAssessment: true,

    // Core metrics
    energy: assessment.energy,
    doms: assessment.doms,
    domsAreas: assessment.domsAreas || [],
    stress: assessment.stress,
    motivation: assessment.motivation,
    availableTime: assessment.availableTime,

    // Boolean states
    hydration: assessment.hydration,
    fasting: assessment.fasting,

    // Menstrual cycle (if applicable)
    menstrualPhase: assessment.menstrualPhase,
    isFollicularPhase: assessment.menstrualPhase === 'follicular',
    isOvulationPhase: assessment.menstrualPhase === 'ovulation',
    isLutealPhase: assessment.menstrualPhase === 'luteal',
    isMenstrualPhase: assessment.menstrualPhase === 'menstrual',

    // Readiness score if calculated
    readinessScore: assessment.readinessScore,

    // Derived flags
    hasLowEnergy: assessment.energy <= 2,
    hasHighEnergy: assessment.energy >= 4,
    hasSignificantDoms: assessment.doms >= 3,
    hasSevereDoms: assessment.doms >= 4,
    hasHighStress: assessment.stress >= 4,
    hasLowMotivation: assessment.motivation <= 2,
    hasHighMotivation: assessment.motivation >= 4,
    isDehydrated: !assessment.hydration,
    isInFastingState: assessment.fasting,
    hasLimitedTime: assessment.availableTime <= 20,
    hasExtendedTime: assessment.availableTime >= 45,

    // DOMS area checks
    hasUpperBodyDoms: (assessment.domsAreas || []).some(area =>
      ['chest', 'back', 'shoulders', 'arms'].includes(area)
    ),
    hasLowerBodyDoms: (assessment.domsAreas || []).some(area =>
      ['quads', 'hamstrings', 'glutes', 'calves'].includes(area)
    ),
    hasCoreDoms: (assessment.domsAreas || []).includes('core'),

    // Readiness level flags
    hasLowReadiness: assessment.readinessScore !== null && assessment.readinessScore < 40,
    hasMediumReadiness: assessment.readinessScore !== null && assessment.readinessScore >= 40 && assessment.readinessScore < 70,
    hasHighReadiness: assessment.readinessScore !== null && assessment.readinessScore >= 70
  };
}

/**
 * Creates a fact provider for post-workout feedback data
 * @param {Object} feedback - The post-workout feedback data
 * @returns {Object} Fact definitions
 */
export function createFeedbackFacts(feedback) {
  if (!feedback) {
    return {
      hasFeedback: false,
      rpe: null,
      completion: null,
      pain: false,
      painAreas: [],
      painIntensity: 0,
      enjoyment: null,
      couldDoMore: false,
      techniqueConfidence: null,
      notes: ''
    };
  }

  return {
    hasFeedback: true,

    // Core metrics
    rpe: feedback.rpe,
    completion: feedback.completion,
    enjoyment: feedback.enjoyment,
    techniqueConfidence: feedback.techniqueConfidence,
    couldDoMore: feedback.couldDoMore,
    notes: feedback.notes || '',

    // Pain data
    pain: feedback.pain,
    painAreas: feedback.painAreas || [],
    painIntensity: feedback.painIntensity || 0,

    // Derived flags
    wasEasy: feedback.rpe !== null && feedback.rpe <= 4,
    wasModerate: feedback.rpe !== null && feedback.rpe >= 5 && feedback.rpe <= 7,
    wasHard: feedback.rpe !== null && feedback.rpe >= 8,
    wasVeryHard: feedback.rpe !== null && feedback.rpe >= 9,

    hadHighCompletion: feedback.completion !== null && feedback.completion >= 90,
    hadMediumCompletion: feedback.completion !== null && feedback.completion >= 60 && feedback.completion < 90,
    hadLowCompletion: feedback.completion !== null && feedback.completion < 60,

    hadPain: feedback.pain,
    hadSeverePain: feedback.painIntensity >= 4,
    hadMildPain: feedback.pain && feedback.painIntensity < 3,

    enjoyedWorkout: feedback.enjoyment !== null && feedback.enjoyment >= 4,
    didNotEnjoy: feedback.enjoyment !== null && feedback.enjoyment <= 2,

    feltConfident: feedback.techniqueConfidence !== null && feedback.techniqueConfidence >= 4,
    lackedConfidence: feedback.techniqueConfidence !== null && feedback.techniqueConfidence <= 2,

    // Progression indicators
    shouldProgress: feedback.rpe !== null && feedback.completion !== null &&
      feedback.rpe <= 6 && feedback.completion >= 90 && feedback.couldDoMore,
    shouldMaintain: feedback.rpe !== null && feedback.completion !== null &&
      feedback.rpe >= 5 && feedback.rpe <= 7 && feedback.completion >= 70,
    shouldRegress: feedback.rpe !== null && feedback.completion !== null &&
      (feedback.rpe >= 9 || feedback.completion < 60 || feedback.pain)
  };
}
