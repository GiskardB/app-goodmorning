import { useState } from 'react';
import {
  BODY_AREAS,
  BODY_AREA_LABELS,
  MENSTRUAL_PHASES,
  MENSTRUAL_PHASE_LABELS,
  MENSTRUAL_PHASE_DESCRIPTIONS,
  WORKOUT_DURATIONS,
  GENDERS
} from '../../utils/constants';
import ReadinessResult from './ReadinessResult';

const ENERGY_LABELS = ['Esausto', 'Stanco', 'Normale', 'Energico', 'Al massimo'];
const DOMS_LABELS = ['Nessuno', 'Leggero', 'Moderato', 'Forte', 'Molto forte'];
const STRESS_LABELS = ['Rilassato', 'Tranquillo', 'Normale', 'Stressato', 'Molto stressato'];
const MOTIVATION_LABELS = ['Zero voglia', 'Poca voglia', 'Normale', 'Motivato', 'Super motivato'];

export default function PreWorkoutAssessment({
  userProfile,
  onComplete,
  onSkip,
  onClose
}) {
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  const [assessment, setAssessment] = useState({
    energy: 3,
    doms: 1,
    domsAreas: [],
    stress: 3,
    motivation: 3,
    availableTime: 30,
    hydration: true,
    fasting: false,
    menstrualPhase: null
  });

  const isFemale = userProfile?.gender === GENDERS.FEMALE;
  const hasDoms = assessment.doms >= 3;

  // Define steps dynamically based on conditions
  const getSteps = () => {
    const steps = [
      { id: 'energy', title: 'Energia' },
      { id: 'doms', title: 'Indolenzimento' }
    ];

    if (hasDoms) {
      steps.push({ id: 'domsAreas', title: 'Zone indolenzite' });
    }

    steps.push(
      { id: 'stress', title: 'Stress' },
      { id: 'motivation', title: 'Motivazione' },
      { id: 'time', title: 'Tempo disponibile' },
      { id: 'lifestyle', title: 'Stile di vita' }
    );

    if (isFemale) {
      steps.push({ id: 'menstrual', title: 'Ciclo mestruale' });
    }

    return steps;
  };

  const steps = getSteps();
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const updateAssessment = (field, value) => {
    setAssessment(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Calculate and show result
      setResultData(assessment);
      setShowResult(true);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = (score) => {
    onComplete({ ...assessment, readinessScore: score });
  };

  if (showResult) {
    return (
      <ReadinessResult
        assessment={resultData}
        userProfile={userProfile}
        onContinue={handleComplete}
        onBack={() => setShowResult(false)}
      />
    );
  }

  const renderSliderStep = (value, onChange, labels, title, subtitle, emoji) => (
    <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">{emoji[value - 1]}</span>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-[var(--text-secondary)]">{subtitle}</p>
      </div>

      <div className="mb-8">
        <div className="text-center mb-4">
          <span className="text-xl font-semibold text-[var(--primary)]">
            {labels[value - 1]}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
        />

        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
          <span>{labels[0]}</span>
          <span>{labels[4]}</span>
        </div>
      </div>

      {/* Visual indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`w-10 h-10 rounded-full font-semibold transition-all ${
              value === i
                ? 'bg-[var(--primary)] text-white scale-110'
                : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'energy':
        return renderSliderStep(
          assessment.energy,
          (v) => updateAssessment('energy', v),
          ENERGY_LABELS,
          'Come ti senti oggi?',
          'Valuta il tuo livello di energia',
          ['😩', '😔', '😐', '😊', '😄']
        );

      case 'doms':
        return renderSliderStep(
          assessment.doms,
          (v) => updateAssessment('doms', v),
          DOMS_LABELS,
          'Quanto sei indolenzito?',
          'Dolore muscolare post-allenamento',
          ['💪', '🤏', '😬', '😖', '🥴']
        );

      case 'domsAreas':
        return (
          <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-4">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🎯</span>
              <h2 className="text-2xl font-bold mb-2">Quali zone sono indolenzite?</h2>
              <p className="text-[var(--text-secondary)]">Seleziona tutte le aree interessate</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
              {Object.entries(BODY_AREAS).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => {
                    const areas = assessment.domsAreas.includes(value)
                      ? assessment.domsAreas.filter(a => a !== value)
                      : [...assessment.domsAreas, value];
                    updateAssessment('domsAreas', areas);
                  }}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    assessment.domsAreas.includes(value)
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  {BODY_AREA_LABELS[value]}
                </button>
              ))}
            </div>
          </div>
        );

      case 'stress':
        return renderSliderStep(
          assessment.stress,
          (v) => updateAssessment('stress', v),
          STRESS_LABELS,
          'Livello di stress?',
          'Come ti senti mentalmente',
          ['😌', '🙂', '😐', '😰', '🤯']
        );

      case 'motivation':
        return renderSliderStep(
          assessment.motivation,
          (v) => updateAssessment('motivation', v),
          MOTIVATION_LABELS,
          'Quanto sei motivato?',
          'Voglia di allenarti oggi',
          ['😴', '😕', '😐', '💪', '🔥']
        );

      case 'time':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">⏱️</span>
              <h2 className="text-2xl font-bold mb-2">Tempo disponibile?</h2>
              <p className="text-[var(--text-secondary)]">Quanto tempo hai per allenarti</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {WORKOUT_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => updateAssessment('availableTime', duration)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    assessment.availableTime === duration
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  <div className={`text-2xl font-bold ${
                    assessment.availableTime === duration ? 'text-[var(--primary)]' : ''
                  }`}>
                    {duration}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">minuti</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🍽️</span>
              <h2 className="text-2xl font-bold mb-2">Domande veloci</h2>
              <p className="text-[var(--text-secondary)]">Aiutaci a personalizzare l'allenamento</p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => updateAssessment('hydration', !assessment.hydration)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  assessment.hydration
                    ? 'border-green-500 bg-green-50'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💧</span>
                  <span className="font-medium">Hai bevuto abbastanza acqua?</span>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors flex items-center ${
                  assessment.hydration ? 'bg-green-500' : 'bg-[var(--border)]'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-1 ${
                    assessment.hydration ? 'translate-x-5' : ''
                  }`} />
                </div>
              </button>

              <button
                onClick={() => updateAssessment('fasting', !assessment.fasting)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  assessment.fasting
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  <span className="font-medium">Sei a digiuno?</span>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors flex items-center ${
                  assessment.fasting ? 'bg-amber-500' : 'bg-[var(--border)]'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-1 ${
                    assessment.fasting ? 'translate-x-5' : ''
                  }`} />
                </div>
              </button>
            </div>

            {assessment.fasting && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-amber-700">
                  Allenarti a digiuno può ridurre le prestazioni. Considera uno snack leggero.
                </p>
              </div>
            )}
          </div>
        );

      case 'menstrual':
        return (
          <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-4">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🌸</span>
              <h2 className="text-2xl font-bold mb-2">Fase del ciclo</h2>
              <p className="text-[var(--text-secondary)]">Opzionale - ci aiuta a personalizzare</p>
            </div>

            <div className="space-y-3 mb-4">
              {Object.entries(MENSTRUAL_PHASES).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => updateAssessment('menstrualPhase', value)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    assessment.menstrualPhase === value
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`font-medium ${
                      assessment.menstrualPhase === value ? 'text-[var(--primary)]' : ''
                    }`}>
                      {MENSTRUAL_PHASE_LABELS[value]}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {MENSTRUAL_PHASE_DESCRIPTIONS[value]}
                    </div>
                  </div>
                  {assessment.menstrualPhase === value && (
                    <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => updateAssessment('menstrualPhase', null)}
              className="text-sm text-[var(--text-secondary)] underline mb-4"
            >
              Preferisco non rispondere
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-[var(--border)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
          <button
            onClick={step > 0 ? handlePrevious : onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step > 0 ? "M15 19l-7-7 7-7" : "M6 18L18 6M6 6l12 12"} />
            </svg>
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            Check-in pre-workout
          </span>
          <button
            onClick={onSkip}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Salta
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-16 pb-24 flex flex-col">
        {renderStepContent()}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)] border-t border-[var(--border)]">
        <button
          onClick={handleNext}
          className="btn-primary w-full py-4 text-lg"
        >
          {isLastStep ? 'Vedi risultato' : 'Continua'}
        </button>
      </div>
    </div>
  );
}
