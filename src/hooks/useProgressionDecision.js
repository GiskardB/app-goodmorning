import { useState, useEffect, useMemo } from 'react';
import { calculateProgressionDecision } from '../utils/calculations';
import { PROGRESSION_ACTIONS } from '../utils/constants';
import { useRulesEngine } from './useRulesEngine';

/**
 * Custom hook for determining workout progression decisions
 * Combines base calculation with rules engine analysis
 */
export function useProgressionDecision(feedback, assessment, userProfile, sessions = []) {
  const [rulesDecision, setRulesDecision] = useState(null);
  const [antiPatterns, setAntiPatterns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const { determineProgression, isLoading } = useRulesEngine();

  // Calculate base progression decision
  const baseDecision = useMemo(() => {
    if (!feedback || feedback.rpe === null || feedback.completion === null) {
      return null;
    }
    return calculateProgressionDecision(feedback.rpe, feedback.completion);
  }, [feedback]);

  // Run rules engine for comprehensive analysis
  useEffect(() => {
    if (!feedback || !userProfile) return;

    const runAnalysis = async () => {
      const result = await determineProgression(userProfile, assessment, feedback, sessions);

      if (result && result.success) {
        setRulesDecision({
          action: result.progressionDecision,
          reason: result.progressionReason
        });
        setAntiPatterns(result.antiPatterns);
        setRecommendations(result.recommendations);
      }
    };

    runAnalysis();
  }, [feedback, assessment, userProfile, sessions, determineProgression]);

  // Combine decisions (rules engine takes priority)
  const { decision, action, label, icon, reason, adjustmentFactor } = useMemo(() => {
    // Default values
    const defaults = {
      decision: 'maintain',
      action: PROGRESSION_ACTIONS.MAINTAIN,
      label: 'Mantieni',
      icon: '➡️',
      reason: 'Continua con questo livello di intensità',
      adjustmentFactor: 1.0
    };

    if (!baseDecision && !rulesDecision) {
      return defaults;
    }

    // Use rules decision if available, otherwise use base calculation
    const finalDecision = rulesDecision?.action || baseDecision || 'maintain';

    const decisionDetails = {
      increase: {
        action: PROGRESSION_ACTIONS.INCREASE,
        label: 'Aumenta',
        icon: '📈',
        adjustmentFactor: 1.1
      },
      maintain: {
        action: PROGRESSION_ACTIONS.MAINTAIN,
        label: 'Mantieni',
        icon: '➡️',
        adjustmentFactor: 1.0
      },
      decrease: {
        action: PROGRESSION_ACTIONS.DECREASE,
        label: 'Riduci',
        icon: '📉',
        adjustmentFactor: 0.9
      }
    };

    const details = decisionDetails[finalDecision] || decisionDetails.maintain;

    return {
      decision: finalDecision,
      action: details.action,
      label: details.label,
      icon: details.icon,
      reason: rulesDecision?.reason || getDefaultReason(finalDecision, feedback),
      adjustmentFactor: details.adjustmentFactor
    };
  }, [baseDecision, rulesDecision, feedback]);

  // Format anti-patterns for display
  const formattedAntiPatterns = useMemo(() => {
    return antiPatterns.map(pattern => ({
      type: pattern.params.pattern,
      severity: pattern.params.severity,
      reason: pattern.params.reason,
      recommendation: pattern.params.recommendation,
      icon: getAntiPatternIcon(pattern.params.pattern)
    }));
  }, [antiPatterns]);

  // Get actionable insights
  const insights = useMemo(() => {
    const list = [];

    // Add main decision insight
    list.push({
      type: 'decision',
      text: reason,
      icon: icon
    });

    // Add anti-pattern warnings
    formattedAntiPatterns.forEach(pattern => {
      list.push({
        type: 'warning',
        text: pattern.recommendation,
        icon: pattern.icon
      });
    });

    // Add top recommendations
    recommendations.slice(0, 3).forEach(rec => {
      list.push({
        type: 'tip',
        text: rec.text,
        icon: '💡'
      });
    });

    return list;
  }, [reason, icon, formattedAntiPatterns, recommendations]);

  // Summary for quick display
  const summary = useMemo(() => {
    return {
      text: `${label}: ${reason}`,
      hasWarnings: antiPatterns.length > 0,
      warningCount: antiPatterns.length
    };
  }, [label, reason, antiPatterns]);

  return {
    decision,
    action,
    label,
    icon,
    reason,
    adjustmentFactor,
    antiPatterns: formattedAntiPatterns,
    recommendations,
    insights,
    summary,
    isLoading,
    baseDecision,
    rulesDecision
  };
}

/**
 * Gets a default reason text for a decision
 */
function getDefaultReason(decision, feedback) {
  if (!feedback) return '';

  const { rpe, completion, couldDoMore, pain } = feedback;

  if (decision === 'increase') {
    if (couldDoMore) {
      return 'Avresti potuto fare di più - sei pronto per il prossimo livello';
    }
    return 'Ottime prestazioni - puoi aumentare l\'intensità';
  }

  if (decision === 'decrease') {
    if (pain) {
      return 'Dolore riportato - riduci l\'intensità per sicurezza';
    }
    if (rpe >= 9) {
      return 'Allenamento molto impegnativo - concediti più recupero';
    }
    if (completion < 60) {
      return 'Completamento basso - prova con meno volume';
    }
    return 'Considera di ridurre l\'intensità';
  }

  return 'Il livello attuale è appropriato per te';
}

/**
 * Gets an icon for anti-pattern types
 */
function getAntiPatternIcon(pattern) {
  const icons = {
    overtraining: '🔥',
    undertraining: '😴',
    inconsistency: '📅',
    motivation_decline: '📉',
    recurring_pain: '⚠️',
    low_completion: '❌',
    streak_broken: '💔'
  };

  return icons[pattern] || '⚠️';
}

export default useProgressionDecision;
