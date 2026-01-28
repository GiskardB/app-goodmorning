import { useState } from 'react';
import { EXPERIENCE_LEVELS, EXPERIENCE_LABELS, EXPERIENCE_DESCRIPTIONS } from '../../utils/constants';

const EXPERIENCE_OPTIONS = [
  {
    value: EXPERIENCE_LEVELS.BEGINNER,
    label: EXPERIENCE_LABELS[EXPERIENCE_LEVELS.BEGINNER],
    description: EXPERIENCE_DESCRIPTIONS[EXPERIENCE_LEVELS.BEGINNER],
    icon: '1',
    color: 'bg-green-500'
  },
  {
    value: EXPERIENCE_LEVELS.INTERMEDIATE,
    label: EXPERIENCE_LABELS[EXPERIENCE_LEVELS.INTERMEDIATE],
    description: EXPERIENCE_DESCRIPTIONS[EXPERIENCE_LEVELS.INTERMEDIATE],
    icon: '2',
    color: 'bg-yellow-500'
  },
  {
    value: EXPERIENCE_LEVELS.ADVANCED,
    label: EXPERIENCE_LABELS[EXPERIENCE_LEVELS.ADVANCED],
    description: EXPERIENCE_DESCRIPTIONS[EXPERIENCE_LEVELS.ADVANCED],
    icon: '3',
    color: 'bg-red-500'
  }
];

export default function ExperienceStep({ data, updateData, onNext }) {
  const [selected, setSelected] = useState(data.experience || '');

  const handleSelect = (value) => {
    setSelected(value);
    updateData('experience', value);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Qual e il tuo livello?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Adatteremo gli allenamenti al tuo livello
        </p>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {EXPERIENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selected === option.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl ${option.color}`}
              >
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-lg font-medium block ${
                  selected === option.value ? 'text-[var(--primary)]' : ''
                }`}>
                  {option.label}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {option.description}
                </span>
              </div>
              {selected === option.value && (
                <svg
                  className="w-6 h-6 text-[var(--primary)] flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Experience level indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {EXPERIENCE_OPTIONS.map((option, index) => (
            <div
              key={option.value}
              className={`h-2 flex-1 rounded-full transition-colors ${
                EXPERIENCE_OPTIONS.findIndex(o => o.value === selected) >= index
                  ? option.color
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={!selected}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continua
        </button>
      </div>
    </div>
  );
}
