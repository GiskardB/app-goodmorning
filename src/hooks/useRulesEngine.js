import { useState, useCallback, useRef, useEffect } from 'react';
import { AdaptiveTrainingEngine } from '../rules/engine';

// Import all rulesets
import readinessRules from '../rules/rulesets/readiness.rules.json';
import progressionRules from '../rules/rulesets/progression.rules.json';
import antiPatternRules from '../rules/rulesets/antiPattern.rules.json';
import specialCasesRules from '../rules/rulesets/specialCases.rules.json';
import exerciseSelectionRules from '../rules/rulesets/exerciseSelection.rules.json';
import alertsRules from '../rules/rulesets/alerts.rules.json';

/**
 * Custom hook for using the adaptive training rules engine
 * Provides methods for evaluating readiness, progression, and anti-patterns
 */
export function useRulesEngine() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const engineRef = useRef(null);

  // Initialize engine on first use
  useEffect(() => {
    if (!engineRef.current) {
      const engine = new AdaptiveTrainingEngine();
      engine.loadAllRulesets([
        readinessRules,
        progressionRules,
        antiPatternRules,
        specialCasesRules,
        exerciseSelectionRules,
        alertsRules
      ]);
      engineRef.current = engine;
    }
  }, []);

  /**
   * Evaluates readiness based on pre-workout assessment
   */
  const evaluateReadiness = useCallback(async (userProfile, assessment, sessions = []) => {
    if (!engineRef.current) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await engineRef.current.evaluateReadiness(userProfile, assessment, sessions);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Determines progression based on workout feedback
   */
  const determineProgression = useCallback(async (userProfile, assessment, feedback, sessions = []) => {
    if (!engineRef.current) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await engineRef.current.determineProgression(userProfile, assessment, feedback, sessions);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Gets exercise recommendations based on current state
   */
  const getExerciseRecommendations = useCallback(async (userProfile, assessment, sessions = []) => {
    if (!engineRef.current) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await engineRef.current.getExerciseRecommendations(userProfile, assessment, sessions);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Detects anti-patterns in training history
   */
  const detectAntiPatterns = useCallback(async (userProfile, sessions = []) => {
    if (!engineRef.current) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await engineRef.current.detectAntiPatterns(userProfile, sessions);
      setLastResult(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    lastResult,
    evaluateReadiness,
    determineProgression,
    getExerciseRecommendations,
    detectAntiPatterns
  };
}

export default useRulesEngine;
