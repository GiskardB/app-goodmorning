import { useMemo } from 'react';
import { calculateReadinessScore, getReadinessLevel } from '../../utils/calculations';
import { READINESS_COLORS, READINESS_LABELS, READINESS_THRESHOLDS } from '../../utils/constants';

export default function ReadinessResult({
  assessment,
  userProfile,
  onContinue,
  onBack
}) {
  const { score, level, color, label, recommendations } = useMemo(() => {
    const calculatedScore = calculateReadinessScore(assessment, userProfile);
    const readinessLevel = getReadinessLevel(calculatedScore);
    const colorKey = readinessLevel.toUpperCase();

    // Generate recommendations based on score and assessment
    const recs = [];

    if (calculatedScore < 40) {
      recs.push({
        icon: '🛌',
        text: 'Considera un allenamento leggero o riposo attivo'
      });
    }

    if (assessment.doms >= 4) {
      recs.push({
        icon: '🧊',
        text: 'Focus su stretching e mobilita per le zone indolenzite'
      });
    }

    if (assessment.stress >= 4) {
      recs.push({
        icon: '🧘',
        text: 'Includi esercizi di respirazione durante l\'allenamento'
      });
    }

    if (!assessment.hydration) {
      recs.push({
        icon: '💧',
        text: 'Bevi almeno 250ml d\'acqua prima di iniziare'
      });
    }

    if (assessment.fasting) {
      recs.push({
        icon: '🍌',
        text: 'Uno snack leggero potrebbe migliorare le prestazioni'
      });
    }

    if (calculatedScore >= 80) {
      recs.push({
        icon: '🚀',
        text: 'Ottima giornata per spingerti un po\' di piu!'
      });
    }

    if (recs.length === 0) {
      recs.push({
        icon: '✅',
        text: 'Sei pronto per un allenamento normale'
      });
    }

    return {
      score: calculatedScore,
      level: readinessLevel,
      color: READINESS_COLORS[colorKey],
      label: READINESS_LABELS[colorKey],
      recommendations: recs
    };
  }, [assessment, userProfile]);

  // Calculate ring percentage
  const circumference = 2 * Math.PI * 45; // r = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium">Il tuo Readiness Score</span>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Score Ring */}
        <div className="relative w-52 h-52 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="104"
              cy="104"
              r="45"
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
              className="scale-[2] origin-center"
            />
            {/* Progress circle */}
            <circle
              cx="104"
              cy="104"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="scale-[2] origin-center transition-all duration-1000"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color }}>{score}</span>
            <span className="text-sm text-[var(--text-secondary)]">su 100</span>
          </div>
        </div>

        {/* Level Badge */}
        <div
          className="px-6 py-2 rounded-full text-white font-semibold mb-4"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>

        {/* Level Description */}
        <p className="text-center text-[var(--text-secondary)] mb-8 max-w-xs">
          {level === 'low' && 'Il tuo corpo ha bisogno di recupero. Ascoltalo e vai piano.'}
          {level === 'medium' && 'Sei in buona forma per un allenamento standard.'}
          {level === 'high' && 'Sei al top! Ottima giornata per dare il massimo.'}
        </p>

        {/* Recommendations */}
        <div className="w-full max-w-md">
          <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Consigli per oggi
          </h3>
          <div className="card p-4 space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{rec.icon}</span>
                <p className="text-sm text-[var(--text-secondary)] pt-1">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="w-full max-w-md mt-6">
          <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Il tuo check-in
          </h3>
          <div className="card p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Energia</span>
                <span className="font-medium">{assessment.energy}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">DOMS</span>
                <span className="font-medium">{assessment.doms}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Stress</span>
                <span className="font-medium">{assessment.stress}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Motivazione</span>
                <span className="font-medium">{assessment.motivation}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <button
          onClick={() => onContinue(score)}
          className="btn-primary w-full py-4 text-lg"
        >
          Inizia l'allenamento
        </button>
      </div>
    </div>
  );
}
