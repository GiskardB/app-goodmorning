import { useState, useEffect, useMemo } from 'react';
import { calculateReadinessScore, getReadinessLevel } from '../utils/calculations';
import { READINESS_COLORS, READINESS_LABELS } from '../utils/constants';
import { useRulesEngine } from './useRulesEngine';

/**
 * Custom hook for calculating and managing readiness score
 * Combines base calculation with rules engine modifiers
 */
export function useReadinessScore(assessment, userProfile, sessions = []) {
  const [modifiers, setModifiers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const { evaluateReadiness, isLoading } = useRulesEngine();

  // Calculate base readiness score
  const baseScore = useMemo(() => {
    if (!assessment) return null;
    return calculateReadinessScore(assessment, userProfile);
  }, [assessment, userProfile]);

  // Evaluate rules and get modifiers
  useEffect(() => {
    if (!assessment || !userProfile) return;

    const runEvaluation = async () => {
      const result = await evaluateReadiness(userProfile, assessment, sessions);

      if (result && result.success) {
        // Extract modifiers from readiness_modifier events
        const mods = result.readinessModifiers.map(event => ({
          value: event.params.modifier,
          reason: event.params.reason,
          category: event.params.category
        }));
        setModifiers(mods);
        setRecommendations(result.recommendations);
        setAlerts(result.alerts);
      }
    };

    runEvaluation();
  }, [assessment, userProfile, sessions, evaluateReadiness]);

  // Calculate final score with modifiers
  const { score, level, color, label, details } = useMemo(() => {
    if (baseScore === null) {
      return {
        score: null,
        level: null,
        color: null,
        label: null,
        details: null
      };
    }

    // Apply modifiers (capped between 0-100)
    const totalModifier = modifiers.reduce((sum, mod) => sum + mod.value, 0);
    const finalScore = Math.max(0, Math.min(100, baseScore + totalModifier));

    const readinessLevel = getReadinessLevel(finalScore);
    const colorKey = readinessLevel.toUpperCase();

    return {
      score: Math.round(finalScore),
      level: readinessLevel,
      color: READINESS_COLORS[colorKey],
      label: READINESS_LABELS[colorKey],
      details: {
        baseScore,
        totalModifier,
        modifiers: [...modifiers]
      }
    };
  }, [baseScore, modifiers]);

  // Generate summary text
  const summary = useMemo(() => {
    if (!level) return '';

    const summaries = {
      low: 'Il tuo corpo ha bisogno di recupero. Ascoltalo e vai piano.',
      medium: 'Sei in buona forma per un allenamento standard.',
      high: 'Sei al top! Ottima giornata per dare il massimo.'
    };

    return summaries[level] || '';
  }, [level]);

  // Filter and prioritize recommendations
  const topRecommendations = useMemo(() => {
    return recommendations
      .slice(0, 5)
      .map(rec => ({
        text: rec.text,
        category: rec.category,
        icon: getCategoryIcon(rec.category)
      }));
  }, [recommendations]);

  return {
    score,
    level,
    color,
    label,
    summary,
    baseScore,
    modifiers,
    recommendations: topRecommendations,
    alerts,
    isLoading,
    details
  };
}

/**
 * Gets an appropriate icon for a recommendation category
 */
function getCategoryIcon(category) {
  const icons = {
    energy: '⚡',
    doms: '💪',
    stress: '🧘',
    motivation: '🎯',
    hydration: '💧',
    nutrition: '🍌',
    menstrual: '🌸',
    recovery: '🛌',
    general: '✅'
  };

  return icons[category] || icons.general;
}

export default useReadinessScore;
