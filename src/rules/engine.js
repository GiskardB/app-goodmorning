/**
 * Rules Engine configuration and setup
 * Uses json-rules-engine for adaptive training decisions
 */

import { Engine } from 'json-rules-engine';
import { allOperators } from './operators';
import { createUserFacts, createAssessmentFacts, createFeedbackFacts } from './facts/userFacts';
import { createHistoryFacts } from './facts/historyFacts';

/**
 * Creates and configures a new rules engine instance
 * @returns {Engine} Configured rules engine
 */
export function createEngine() {
  const engine = new Engine();

  // Register all custom operators
  allOperators.forEach(op => {
    engine.addOperator(op.name, op.callback);
  });

  return engine;
}

/**
 * Loads rules from a ruleset object into the engine
 * @param {Engine} engine - The rules engine instance
 * @param {Object} ruleset - The ruleset JSON object
 */
export function loadRuleset(engine, ruleset) {
  if (!ruleset || !ruleset.rules) {
    console.warn('Invalid ruleset provided');
    return;
  }

  ruleset.rules.forEach(rule => {
    try {
      engine.addRule(rule);
    } catch (error) {
      console.error(`Failed to add rule: ${rule.name}`, error);
    }
  });
}

/**
 * Prepares facts for the engine from various data sources
 * @param {Object} params - Parameters containing data sources
 * @returns {Object} Facts object ready for the engine
 */
export function prepareFacts({ userProfile, assessment, feedback, sessions = [] }) {
  return {
    // User profile facts
    ...createUserFacts(userProfile),

    // Assessment facts (prefixed to avoid conflicts)
    assessment: createAssessmentFacts(assessment),

    // Feedback facts (prefixed)
    feedback: createFeedbackFacts(feedback),

    // History facts (prefixed)
    history: createHistoryFacts(sessions),

    // Direct access to commonly used values
    readinessScore: assessment?.readinessScore ?? null,
    currentRpe: feedback?.rpe ?? null,
    currentCompletion: feedback?.completion ?? null,

    // Time-based facts
    timestamp: new Date().toISOString(),
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),
    isWeekend: [0, 6].includes(new Date().getDay())
  };
}

/**
 * Runs the rules engine with provided facts
 * @param {Engine} engine - The rules engine instance
 * @param {Object} facts - Facts object
 * @returns {Promise<Object>} Engine results with events and almanac
 */
export async function runEngine(engine, facts) {
  try {
    const results = await engine.run(facts);
    return {
      success: true,
      events: results.events,
      almanac: results.almanac,
      failureEvents: results.failureEvents || []
    };
  } catch (error) {
    console.error('Rules engine error:', error);
    return {
      success: false,
      events: [],
      almanac: null,
      failureEvents: [],
      error: error.message
    };
  }
}

/**
 * Extracts specific action types from engine results
 * @param {Array} events - Array of events from engine results
 * @param {string} actionType - The action type to filter for
 * @returns {Array} Filtered events
 */
export function filterEventsByType(events, actionType) {
  return events.filter(e => e.type === actionType);
}

/**
 * Gets the highest priority event of a specific type
 * @param {Array} events - Array of events
 * @param {string} actionType - The action type
 * @returns {Object|null} The highest priority event or null
 */
export function getHighestPriorityEvent(events, actionType) {
  const filtered = filterEventsByType(events, actionType);
  if (filtered.length === 0) return null;

  return filtered.reduce((highest, current) => {
    const currentPriority = current.params?.priority ?? 0;
    const highestPriority = highest.params?.priority ?? 0;
    return currentPriority > highestPriority ? current : highest;
  }, filtered[0]);
}

/**
 * Aggregates all recommendations from events
 * @param {Array} events - Array of events
 * @returns {Array} Array of recommendation strings
 */
export function aggregateRecommendations(events) {
  const recommendations = [];

  events.forEach(event => {
    if (event.params?.recommendation) {
      recommendations.push({
        text: event.params.recommendation,
        priority: event.params.priority ?? 0,
        category: event.params.category ?? 'general'
      });
    }
  });

  // Sort by priority descending
  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Creates a combined engine runner that handles the full workflow
 */
export class AdaptiveTrainingEngine {
  constructor() {
    this.engine = createEngine();
    this.rulesLoaded = false;
  }

  /**
   * Loads all rulesets into the engine
   * @param {Array<Object>} rulesets - Array of ruleset objects
   */
  loadAllRulesets(rulesets) {
    rulesets.forEach(ruleset => loadRuleset(this.engine, ruleset));
    this.rulesLoaded = true;
  }

  /**
   * Evaluates readiness based on pre-workout assessment
   * @param {Object} userProfile - User profile
   * @param {Object} assessment - Pre-workout assessment
   * @param {Array} sessions - Session history
   * @returns {Promise<Object>} Readiness evaluation results
   */
  async evaluateReadiness(userProfile, assessment, sessions = []) {
    const facts = prepareFacts({ userProfile, assessment, sessions });
    const results = await runEngine(this.engine, facts);

    return {
      ...results,
      readinessModifiers: filterEventsByType(results.events, 'readiness_modifier'),
      recommendations: aggregateRecommendations(results.events),
      alerts: filterEventsByType(results.events, 'alert')
    };
  }

  /**
   * Determines progression based on workout feedback
   * @param {Object} userProfile - User profile
   * @param {Object} assessment - Pre-workout assessment
   * @param {Object} feedback - Post-workout feedback
   * @param {Array} sessions - Session history
   * @returns {Promise<Object>} Progression decision results
   */
  async determineProgression(userProfile, assessment, feedback, sessions = []) {
    const facts = prepareFacts({ userProfile, assessment, feedback, sessions });
    const results = await runEngine(this.engine, facts);

    const progressionEvent = getHighestPriorityEvent(results.events, 'progression');
    const antiPatterns = filterEventsByType(results.events, 'anti_pattern');

    return {
      ...results,
      progressionDecision: progressionEvent?.params?.action ?? 'maintain',
      progressionReason: progressionEvent?.params?.reason ?? '',
      antiPatterns,
      recommendations: aggregateRecommendations(results.events)
    };
  }

  /**
   * Gets exercise selection recommendations
   * @param {Object} userProfile - User profile
   * @param {Object} assessment - Pre-workout assessment
   * @param {Array} sessions - Session history
   * @returns {Promise<Object>} Exercise selection results
   */
  async getExerciseRecommendations(userProfile, assessment, sessions = []) {
    const facts = prepareFacts({ userProfile, assessment, sessions });
    const results = await runEngine(this.engine, facts);

    return {
      ...results,
      excludeExercises: filterEventsByType(results.events, 'exclude_exercise'),
      modifyExercises: filterEventsByType(results.events, 'modify_exercise'),
      recommendExercises: filterEventsByType(results.events, 'recommend_exercise')
    };
  }

  /**
   * Checks for anti-patterns in training history
   * @param {Object} userProfile - User profile
   * @param {Array} sessions - Session history
   * @returns {Promise<Object>} Anti-pattern detection results
   */
  async detectAntiPatterns(userProfile, sessions = []) {
    const facts = prepareFacts({ userProfile, sessions });
    const results = await runEngine(this.engine, facts);

    return {
      ...results,
      detectedPatterns: filterEventsByType(results.events, 'anti_pattern'),
      warnings: filterEventsByType(results.events, 'warning'),
      suggestions: aggregateRecommendations(results.events)
    };
  }
}

// Export a default instance
export const adaptiveEngine = new AdaptiveTrainingEngine();
