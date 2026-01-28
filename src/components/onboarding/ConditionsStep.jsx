import { useState } from 'react';
import { CONDITIONS, CONDITION_LABELS } from '../../utils/constants';

const CONDITION_OPTIONS = Object.entries(CONDITIONS)
  .filter(([key]) => key !== 'NONE')
  .map(([key, value]) => ({
    value,
    label: CONDITION_LABELS[value]
  }));

export default function ConditionsStep({ data, updateData, onNext }) {
  const [selected, setSelected] = useState(data.conditions || []);
  const [hasNone, setHasNone] = useState(
    data.conditions?.length === 0 || data.conditions?.includes(CONDITIONS.NONE)
  );

  const toggleCondition = (value) => {
    if (value === CONDITIONS.NONE) {
      setHasNone(!hasNone);
      if (!hasNone) {
        setSelected([]);
        updateData('conditions', []);
      }
      return;
    }

    setHasNone(false);
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];

    setSelected(newSelected);
    updateData('conditions', newSelected);
  };

  const handleContinue = () => {
    if (hasNone) {
      updateData('conditions', []);
    }
    onNext();
  };

  const isValid = hasNone || selected.length > 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full pt-4">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Hai limitazioni fisiche?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Seleziona tutte le condizioni che ti riguardano
        </p>

        {/* None option */}
        <button
          onClick={() => toggleCondition(CONDITIONS.NONE)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all mb-4 ${
            hasNone
              ? 'border-green-500 bg-green-50'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-green-500/50'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              hasNone
                ? 'border-green-500 bg-green-500'
                : 'border-[var(--border)]'
            }`}
          >
            {hasNone && (
              <svg width="14" height="14" fill="white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className={`font-medium ${hasNone ? 'text-green-600' : ''}`}>
            Nessuna limitazione
          </span>
          {hasNone && (
            <svg className="w-5 h-5 ml-auto text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-[var(--bg)] text-[var(--text-muted)]">oppure seleziona</span>
          </div>
        </div>

        {/* Conditions grid */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {CONDITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleCondition(option.value)}
              disabled={hasNone}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left text-sm ${
                selected.includes(option.value)
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : hasNone
                  ? 'border-[var(--border)] bg-[var(--surface)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected.includes(option.value)
                    ? 'border-[var(--primary)] bg-[var(--primary)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {selected.includes(option.value) && (
                  <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={selected.includes(option.value) ? 'text-[var(--primary)]' : ''}>
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-700">
              Queste informazioni ci aiutano a suggerirti esercizi sicuri. In caso di dubbi, consulta un medico.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continua
        </button>
      </div>
    </div>
  );
}
