// Goals
export const GOALS = {
  TONING: 'toning',
  STRENGTH: 'strength',
  ENDURANCE: 'endurance',
  FLEXIBILITY: 'flexibility'
};

export const GOAL_LABELS = {
  [GOALS.TONING]: 'Tonificazione',
  [GOALS.STRENGTH]: 'Forza',
  [GOALS.ENDURANCE]: 'Resistenza',
  [GOALS.FLEXIBILITY]: 'Flessibilità'
};

export const GOAL_DESCRIPTIONS = {
  [GOALS.TONING]: 'Migliora la definizione muscolare e riduci il grasso corporeo',
  [GOALS.STRENGTH]: 'Aumenta la forza e la massa muscolare',
  [GOALS.ENDURANCE]: 'Migliora la resistenza cardiovascolare e la stamina',
  [GOALS.FLEXIBILITY]: 'Aumenta la mobilità articolare e la flessibilità muscolare'
};

// Experience levels
export const EXPERIENCE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

export const EXPERIENCE_LABELS = {
  [EXPERIENCE_LEVELS.BEGINNER]: 'Principiante',
  [EXPERIENCE_LEVELS.INTERMEDIATE]: 'Intermedio',
  [EXPERIENCE_LEVELS.ADVANCED]: 'Avanzato'
};

export const EXPERIENCE_DESCRIPTIONS = {
  [EXPERIENCE_LEVELS.BEGINNER]: 'Nuovo al fitness o ritorno dopo lunga pausa',
  [EXPERIENCE_LEVELS.INTERMEDIATE]: 'Allenamento regolare da 6+ mesi',
  [EXPERIENCE_LEVELS.ADVANCED]: 'Esperienza pluriennale di allenamento'
};

// Gender
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

export const GENDER_LABELS = {
  [GENDERS.MALE]: 'Uomo',
  [GENDERS.FEMALE]: 'Donna',
  [GENDERS.OTHER]: 'Altro'
};

// Menstrual phases (for women)
export const MENSTRUAL_PHASES = {
  FOLLICULAR: 'follicular',
  OVULATION: 'ovulation',
  LUTEAL: 'luteal',
  MENSTRUAL: 'menstrual'
};

export const MENSTRUAL_PHASE_LABELS = {
  [MENSTRUAL_PHASES.FOLLICULAR]: 'Follicolare',
  [MENSTRUAL_PHASES.OVULATION]: 'Ovulazione',
  [MENSTRUAL_PHASES.LUTEAL]: 'Luteale',
  [MENSTRUAL_PHASES.MENSTRUAL]: 'Mestruale'
};

export const MENSTRUAL_PHASE_DESCRIPTIONS = {
  [MENSTRUAL_PHASES.FOLLICULAR]: 'Dopo le mestruazioni, energia in aumento',
  [MENSTRUAL_PHASES.OVULATION]: 'Picco energetico, massime performance',
  [MENSTRUAL_PHASES.LUTEAL]: 'Post-ovulazione, energia variabile',
  [MENSTRUAL_PHASES.MENSTRUAL]: 'Durante le mestruazioni, riposo consigliato'
};

// Body areas for pain/DOMS tracking
export const BODY_AREAS = {
  NECK: 'neck',
  SHOULDERS: 'shoulders',
  UPPER_BACK: 'upper_back',
  LOWER_BACK: 'lower_back',
  CHEST: 'chest',
  ARMS: 'arms',
  ABS: 'abs',
  GLUTES: 'glutes',
  THIGHS: 'thighs',
  CALVES: 'calves',
  KNEES: 'knees',
  ANKLES: 'ankles'
};

export const BODY_AREA_LABELS = {
  [BODY_AREAS.NECK]: 'Collo',
  [BODY_AREAS.SHOULDERS]: 'Spalle',
  [BODY_AREAS.UPPER_BACK]: 'Dorsali',
  [BODY_AREAS.LOWER_BACK]: 'Lombari',
  [BODY_AREAS.CHEST]: 'Petto',
  [BODY_AREAS.ARMS]: 'Braccia',
  [BODY_AREAS.ABS]: 'Addominali',
  [BODY_AREAS.GLUTES]: 'Glutei',
  [BODY_AREAS.THIGHS]: 'Cosce',
  [BODY_AREAS.CALVES]: 'Polpacci',
  [BODY_AREAS.KNEES]: 'Ginocchia',
  [BODY_AREAS.ANKLES]: 'Caviglie'
};

// Physical conditions/limitations
export const CONDITIONS = {
  BACK_PAIN: 'back_pain',
  KNEE_ISSUES: 'knee_issues',
  SHOULDER_ISSUES: 'shoulder_issues',
  NECK_PAIN: 'neck_pain',
  JOINT_ISSUES: 'joint_issues',
  HEART_CONDITION: 'heart_condition',
  PREGNANCY: 'pregnancy',
  RECENT_SURGERY: 'recent_surgery',
  NONE: 'none'
};

export const CONDITION_LABELS = {
  [CONDITIONS.BACK_PAIN]: 'Problemi alla schiena',
  [CONDITIONS.KNEE_ISSUES]: 'Problemi alle ginocchia',
  [CONDITIONS.SHOULDER_ISSUES]: 'Problemi alle spalle',
  [CONDITIONS.NECK_PAIN]: 'Dolore al collo',
  [CONDITIONS.JOINT_ISSUES]: 'Problemi articolari',
  [CONDITIONS.HEART_CONDITION]: 'Patologie cardiache',
  [CONDITIONS.PREGNANCY]: 'Gravidanza',
  [CONDITIONS.RECENT_SURGERY]: 'Intervento recente',
  [CONDITIONS.NONE]: 'Nessuna limitazione'
};

// Time durations for workout
export const WORKOUT_DURATIONS = [15, 30, 45, 60];

// RPE Scale descriptions
export const RPE_SCALE = {
  1: { label: 'Molto leggero', description: 'Quasi nessuno sforzo' },
  2: { label: 'Leggero', description: 'Sforzo minimo' },
  3: { label: 'Moderato', description: 'Sforzo leggero ma percepibile' },
  4: { label: 'Abbastanza impegnativo', description: 'Inizio a faticare' },
  5: { label: 'Impegnativo', description: 'Sforzo consistente' },
  6: { label: 'Difficile', description: 'Fatica evidente' },
  7: { label: 'Molto difficile', description: 'Richiede concentrazione' },
  8: { label: 'Estremamente difficile', description: 'Quasi al limite' },
  9: { label: 'Massimale', description: 'Sforzo quasi massimo' },
  10: { label: 'Impossibile continuare', description: 'Limite assoluto raggiunto' }
};

// Readiness score thresholds
export const READINESS_THRESHOLDS = {
  LOW: 40,       // 0-40: Red zone, reduce intensity
  MEDIUM: 70,    // 41-70: Yellow zone, normal workout
  HIGH: 100      // 71-100: Green zone, can push harder
};

export const READINESS_COLORS = {
  LOW: '#ef4444',     // red-500
  MEDIUM: '#eab308',  // yellow-500
  HIGH: '#22c55e'     // green-500
};

export const READINESS_LABELS = {
  LOW: 'Riposo consigliato',
  MEDIUM: 'Allenamento normale',
  HIGH: 'Pronto per spingerti!'
};

// Progression decisions
export const PROGRESSION_ACTIONS = {
  INCREASE: 'increase',
  MAINTAIN: 'maintain',
  DECREASE: 'decrease',
  REST: 'rest'
};

export const PROGRESSION_LABELS = {
  [PROGRESSION_ACTIONS.INCREASE]: 'Aumenta intensità',
  [PROGRESSION_ACTIONS.MAINTAIN]: 'Mantieni il ritmo',
  [PROGRESSION_ACTIONS.DECREASE]: 'Riduci intensità',
  [PROGRESSION_ACTIONS.REST]: 'Giorno di riposo'
};

// Anti-pattern types
export const ANTI_PATTERN_TYPES = {
  OVERTRAINING: 'overtraining',
  UNDERRECOVERY: 'underrecovery',
  PAIN_IGNORED: 'pain_ignored',
  SKIPPING_WARMUP: 'skipping_warmup',
  LOW_COMPLETION: 'low_completion',
  INCONSISTENT: 'inconsistent',
  HIGH_RPE_STREAK: 'high_rpe_streak'
};

export const ANTI_PATTERN_LABELS = {
  [ANTI_PATTERN_TYPES.OVERTRAINING]: 'Possibile sovrallenamento',
  [ANTI_PATTERN_TYPES.UNDERRECOVERY]: 'Recupero insufficiente',
  [ANTI_PATTERN_TYPES.PAIN_IGNORED]: 'Dolore ignorato ripetutamente',
  [ANTI_PATTERN_TYPES.SKIPPING_WARMUP]: 'Riscaldamento saltato spesso',
  [ANTI_PATTERN_TYPES.LOW_COMPLETION]: 'Completamento basso costante',
  [ANTI_PATTERN_TYPES.INCONSISTENT]: 'Allenamento irregolare',
  [ANTI_PATTERN_TYPES.HIGH_RPE_STREAK]: 'RPE alto consecutivo'
};

// Weights for readiness calculation
export const READINESS_WEIGHTS = {
  energy: 0.30,
  doms: 0.30,
  stress: 0.15,
  motivation: 0.10,
  menstrualPhase: 0.15  // Redistributed if not applicable
};

// Menstrual phase modifiers for readiness
export const MENSTRUAL_PHASE_MODIFIERS = {
  [MENSTRUAL_PHASES.FOLLICULAR]: 1.1,    // Slight boost
  [MENSTRUAL_PHASES.OVULATION]: 1.15,    // Peak performance
  [MENSTRUAL_PHASES.LUTEAL]: 0.95,       // Slight reduction
  [MENSTRUAL_PHASES.MENSTRUAL]: 0.85     // Notable reduction
};

// BMI Categories
export const BMI_CATEGORIES = {
  UNDERWEIGHT: { max: 18.5, label: 'Sottopeso', color: '#3b82f6' },
  NORMAL: { max: 25, label: 'Normopeso', color: '#22c55e' },
  OVERWEIGHT: { max: 30, label: 'Sovrappeso', color: '#eab308' },
  OBESE: { max: Infinity, label: 'Obesità', color: '#ef4444' }
};

// Age categories for fitness adjustments
export const AGE_CATEGORIES = {
  YOUNG: { max: 30, label: 'Giovane', recoveryMultiplier: 1.0 },
  ADULT: { max: 45, label: 'Adulto', recoveryMultiplier: 1.1 },
  MATURE: { max: 60, label: 'Maturo', recoveryMultiplier: 1.2 },
  SENIOR: { max: Infinity, label: 'Senior', recoveryMultiplier: 1.3 }
};
