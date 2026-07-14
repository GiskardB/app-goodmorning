import { useMemo } from 'react';
import { calculateReadinessScore, getReadinessLevel } from '../../utils/calculations';
import { READINESS_COLORS, READINESS_LABELS, READINESS_THRESHOLDS } from '../../utils/constants';

export default function ReadinessResult({
  assessment,
  userProfile,
  onContinue,
  onBack,
  getAdaptationPreview
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

  // Anteprima dell'adattamento del workout (sostituzioni e durate)
  const adaptation = useMemo(
    () => (getAdaptationPreview ? getAdaptationPreview(score, assessment.domsAreas) : null),
    [getAdaptationPreview, score, assessment]
  );

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
        <div className="relative w-56 h-56 mb-8">
          <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
            <defs>
              <linearGradient id="readinessRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                <stop offset="100%" stopColor={color} stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx="110"
              cy="110"
              r="95"
              fill="none"
              stroke="var(--border)"
              strokeWidth="7"
            />
            {/* Progress circle */}
            <circle
              cx="110"
              cy="110"
              r="95"
              fill="none"
              stroke="url(#readinessRing)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 95}
              strokeDashoffset={(2 * Math.PI * 95) * (1 - score / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tracking-tight leading-none" style={{ color }}>{score}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1.5">su 100</span>
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

        {/* Workout Adaptation Preview */}
        {adaptation && (
          <div className="w-full max-w-md mb-6">
            <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Come cambierà il workout
            </h3>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{adaptation.icon}</span>
                <div>
                  <p className="font-semibold text-sm">Workout {adaptation.label.toLowerCase()}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Durata esercizi {adaptation.durationFactor > 1 ? '+' : ''}{Math.round((adaptation.durationFactor - 1) * 100)}%
                  </p>
                </div>
              </div>
              {adaptation.changes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                  {adaptation.changes.map((change, i) => (
                    <p key={i} className="text-xs text-[var(--text-secondary)]">
                      <span className="line-through opacity-60">{change.from}</span>
                      {' → '}
                      <span className="font-medium text-[var(--text)]">{change.to}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          Inizia l'allenamento
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
