import { useState } from 'react';
import {
  BODY_AREAS,
  BODY_AREA_LABELS,
  RPE_SCALE,
  PROGRESSION_ACTIONS
} from '../../utils/constants';
import { calculateProgressionDecision } from '../../utils/calculations';

const ENJOYMENT_LABELS = ['Per niente', 'Poco', 'Abbastanza', 'Molto', 'Tantissimo'];
const TECHNIQUE_LABELS = ['Insicuro', 'Qualche dubbio', 'Ok', 'Sicuro', 'Perfetto'];

export default function PostWorkoutFeedback({
  workoutData,
  recentSessions,
  onComplete,
  onSkip,
  onClose
}) {
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [feedback, setFeedback] = useState({
    rpe: 5,
    completion: 100,
    pain: false,
    painAreas: [],
    painIntensity: 3,
    enjoyment: 3,
    couldDoMore: false,
    techniqueConfidence: 3,
    notes: ''
  });

  const hasPain = feedback.pain;

  const getSteps = () => {
    const steps = [
      { id: 'rpe', title: 'Sforzo percepito' },
      { id: 'completion', title: 'Completamento' },
      { id: 'pain', title: 'Dolore' }
    ];

    if (hasPain) {
      steps.push({ id: 'painDetails', title: 'Dettagli dolore' });
    }

    steps.push(
      { id: 'enjoyment', title: 'Divertimento' },
      { id: 'couldDoMore', title: 'Capacita residua' },
      { id: 'technique', title: 'Tecnica' },
      { id: 'notes', title: 'Note' }
    );

    return steps;
  };

  const steps = getSteps();
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  const updateFeedback = (field, value) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isLastStep) {
      // Calculate progression and show result
      const progressionHistory = {
        recentSessions: recentSessions || [],
        painReported: feedback.pain,
        consecutiveHighRPE: calculateConsecutiveHighRPE(recentSessions || [])
      };

      const progression = calculateProgressionDecision(
        feedback.rpe,
        feedback.completion,
        progressionHistory
      );

      setShowResult(true);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const calculateConsecutiveHighRPE = (sessions) => {
    let count = 0;
    for (const session of sessions) {
      if (session.postWorkout?.rpe >= 8) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(feedback);
  };

  if (showResult) {
    const progressionHistory = {
      recentSessions: recentSessions || [],
      painReported: feedback.pain,
      consecutiveHighRPE: calculateConsecutiveHighRPE(recentSessions || [])
    };

    const progression = calculateProgressionDecision(
      feedback.rpe,
      feedback.completion,
      progressionHistory
    );

    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col">
        <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowResult(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)]"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium">Riepilogo</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">
                {progression.action === PROGRESSION_ACTIONS.INCREASE ? '📈' :
                 progression.action === PROGRESSION_ACTIONS.DECREASE ? '📉' :
                 progression.action === PROGRESSION_ACTIONS.REST ? '🛌' : '⚖️'}
              </span>
              <h2 className="text-2xl font-bold mb-2">Ottimo lavoro!</h2>
              <p className="text-[var(--text-secondary)]">
                Ecco come sta andando il tuo percorso
              </p>
            </div>

            {/* Stats Summary */}
            <div className="card p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[var(--primary)]">{feedback.rpe}</div>
                  <div className="text-xs text-[var(--text-secondary)]">RPE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--primary)]">{feedback.completion}%</div>
                  <div className="text-xs text-[var(--text-secondary)]">Completato</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--primary)]">{feedback.enjoyment}/5</div>
                  <div className="text-xs text-[var(--text-secondary)]">Divertimento</div>
                </div>
              </div>
            </div>

            {/* Progression Recommendation */}
            <div className={`card p-4 mb-6 ${
              progression.action === PROGRESSION_ACTIONS.INCREASE ? 'bg-green-50 border-green-200' :
              progression.action === PROGRESSION_ACTIONS.DECREASE ? 'bg-amber-50 border-amber-200' :
              progression.action === PROGRESSION_ACTIONS.REST ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                progression.action === PROGRESSION_ACTIONS.INCREASE ? 'text-green-700' :
                progression.action === PROGRESSION_ACTIONS.DECREASE ? 'text-amber-700' :
                progression.action === PROGRESSION_ACTIONS.REST ? 'text-red-700' :
                'text-blue-700'
              }`}>
                Suggerimento per la prossima sessione
              </h3>
              <p className={`text-sm ${
                progression.action === PROGRESSION_ACTIONS.INCREASE ? 'text-green-600' :
                progression.action === PROGRESSION_ACTIONS.DECREASE ? 'text-amber-600' :
                progression.action === PROGRESSION_ACTIONS.REST ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {progression.reason}
              </p>
            </div>

            {/* Pain Alert */}
            {feedback.pain && (
              <div className="card p-4 mb-6 bg-red-50 border-red-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-red-700 mb-1">Dolore riportato</h3>
                    <p className="text-sm text-red-600">
                      Zone: {feedback.painAreas.map(a => BODY_AREA_LABELS[a]).join(', ')}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Se il dolore persiste, considera di consultare un professionista.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {feedback.notes && (
              <div className="card p-4 mb-6">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Le tue note</h3>
                <p className="text-sm text-[var(--text-secondary)]">{feedback.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)]">
          <button
            onClick={handleComplete}
            className="btn-primary w-full py-4 text-lg"
          >
            Completa sessione
          </button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'rpe':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">💪</span>
              <h2 className="text-2xl font-bold mb-2">Quanto e stato difficile?</h2>
              <p className="text-[var(--text-secondary)]">Rate of Perceived Exertion (RPE)</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-[var(--primary)]">{feedback.rpe}</span>
              <p className="text-lg font-medium mt-2">{RPE_SCALE[feedback.rpe]?.label}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {RPE_SCALE[feedback.rpe]?.description}
              </p>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={feedback.rpe}
              onChange={(e) => updateFeedback('rpe', parseInt(e.target.value))}
              className="w-full h-3 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] mb-4"
            />

            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Facile</span>
              <span>Massimale</span>
            </div>

            <div className="flex justify-center gap-1 mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <button
                  key={i}
                  onClick={() => updateFeedback('rpe', i)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    feedback.rpe === i
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

      case 'completion':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">✅</span>
              <h2 className="text-2xl font-bold mb-2">Quanto hai completato?</h2>
              <p className="text-[var(--text-secondary)]">Percentuale dell'allenamento eseguito</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-[var(--primary)]">{feedback.completion}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={feedback.completion}
              onChange={(e) => updateFeedback('completion', parseInt(e.target.value))}
              className="w-full h-3 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] mb-4"
            />

            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {[25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => updateFeedback('completion', v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    feedback.completion === v
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--surface-hover)] text-[var(--text-secondary)]'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        );

      case 'pain':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🩹</span>
              <h2 className="text-2xl font-bold mb-2">Hai avvertito dolore?</h2>
              <p className="text-[var(--text-secondary)]">Non il normale affaticamento, ma dolore vero</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => updateFeedback('pain', false)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  !feedback.pain
                    ? 'border-green-500 bg-green-50'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <span className="text-3xl block mb-2">😊</span>
                <span className={`font-medium ${!feedback.pain ? 'text-green-600' : ''}`}>No</span>
              </button>
              <button
                onClick={() => updateFeedback('pain', true)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  feedback.pain
                    ? 'border-red-500 bg-red-50'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <span className="text-3xl block mb-2">😣</span>
                <span className={`font-medium ${feedback.pain ? 'text-red-600' : ''}`}>Si</span>
              </button>
            </div>
          </div>
        );

      case 'painDetails':
        return (
          <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-4">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🎯</span>
              <h2 className="text-2xl font-bold mb-2">Dove hai sentito dolore?</h2>
              <p className="text-[var(--text-secondary)]">Seleziona le zone interessate</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {Object.entries(BODY_AREAS).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => {
                    const areas = feedback.painAreas.includes(value)
                      ? feedback.painAreas.filter(a => a !== value)
                      : [...feedback.painAreas, value];
                    updateFeedback('painAreas', areas);
                  }}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
                    feedback.painAreas.includes(value)
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-[var(--border)] bg-[var(--surface)]'
                  }`}
                >
                  {BODY_AREA_LABELS[value]}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Intensita del dolore</label>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.painIntensity}
                onChange={(e) => updateFeedback('painIntensity', parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>Lieve</span>
                <span>Forte</span>
              </div>
            </div>
          </div>
        );

      case 'enjoyment':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">
                {['😞', '😕', '😐', '😊', '🤩'][feedback.enjoyment - 1]}
              </span>
              <h2 className="text-2xl font-bold mb-2">Ti sei divertito?</h2>
              <p className="text-[var(--text-secondary)]">L'allenamento ti e piaciuto?</p>
            </div>

            <div className="text-center mb-4">
              <span className="text-xl font-semibold text-[var(--primary)]">
                {ENJOYMENT_LABELS[feedback.enjoyment - 1]}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={feedback.enjoyment}
              onChange={(e) => updateFeedback('enjoyment', parseInt(e.target.value))}
              className="w-full h-3 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] mb-4"
            />

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => updateFeedback('enjoyment', i)}
                  className={`w-12 h-12 rounded-full text-xl transition-all ${
                    feedback.enjoyment === i
                      ? 'bg-[var(--primary)]/10 scale-125'
                      : ''
                  }`}
                >
                  {['😞', '😕', '😐', '😊', '🤩'][i - 1]}
                </button>
              ))}
            </div>
          </div>
        );

      case 'couldDoMore':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">💭</span>
              <h2 className="text-2xl font-bold mb-2">Avresti potuto fare di piu?</h2>
              <p className="text-[var(--text-secondary)]">Ti sentivi di continuare?</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => updateFeedback('couldDoMore', true)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  feedback.couldDoMore
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <span className="text-3xl block mb-2">💪</span>
                <span className={`font-medium ${feedback.couldDoMore ? 'text-[var(--primary)]' : ''}`}>
                  Si, potevo continuare
                </span>
              </button>
              <button
                onClick={() => updateFeedback('couldDoMore', false)}
                className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                  !feedback.couldDoMore
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-[var(--surface)]'
                }`}
              >
                <span className="text-3xl block mb-2">😅</span>
                <span className={`font-medium ${!feedback.couldDoMore ? 'text-[var(--primary)]' : ''}`}>
                  No, ero al limite
                </span>
              </button>
            </div>
          </div>
        );

      case 'technique':
        return (
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🎯</span>
              <h2 className="text-2xl font-bold mb-2">Sicurezza nella tecnica?</h2>
              <p className="text-[var(--text-secondary)]">Come ti sei sentito nell'esecuzione</p>
            </div>

            <div className="text-center mb-4">
              <span className="text-xl font-semibold text-[var(--primary)]">
                {TECHNIQUE_LABELS[feedback.techniqueConfidence - 1]}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={feedback.techniqueConfidence}
              onChange={(e) => updateFeedback('techniqueConfidence', parseInt(e.target.value))}
              className="w-full h-3 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] mb-4"
            />

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => updateFeedback('techniqueConfidence', i)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all ${
                    feedback.techniqueConfidence === i
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

      case 'notes':
        return (
          <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 pt-8">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">📝</span>
              <h2 className="text-2xl font-bold mb-2">Note aggiuntive</h2>
              <p className="text-[var(--text-secondary)]">Opzionale - scrivi quello che vuoi</p>
            </div>

            <textarea
              value={feedback.notes}
              onChange={(e) => updateFeedback('notes', e.target.value)}
              placeholder="Es: Ho modificato alcuni esercizi, mi sentivo particolarmente bene/male..."
              className="w-full h-40 p-4 rounded-xl border-2 border-[var(--border)] bg-[var(--surface)] resize-none outline-none focus:border-[var(--primary)] transition-colors"
            />

            <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
              Puoi lasciare vuoto e continuare
            </p>
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
            Feedback post-workout
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
          {isLastStep ? 'Vedi riepilogo' : 'Continua'}
        </button>
      </div>
    </div>
  );
}
