import { useState } from 'react';
import { GOALS, GOAL_LABELS, GOAL_DESCRIPTIONS } from '../../utils/constants';

const GOAL_OPTIONS = [
  {
    value: GOALS.TONING,
    label: GOAL_LABELS[GOALS.TONING],
    description: GOAL_DESCRIPTIONS[GOALS.TONING],
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-amber-500'
  },
  {
    value: GOALS.STRENGTH,
    label: GOAL_LABELS[GOALS.STRENGTH],
    description: GOAL_DESCRIPTIONS[GOALS.STRENGTH],
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
      </svg>
    ),
    color: 'bg-red-500'
  },
  {
    value: GOALS.ENDURANCE,
    label: GOAL_LABELS[GOALS.ENDURANCE],
    description: GOAL_DESCRIPTIONS[GOALS.ENDURANCE],
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
      </svg>
    ),
    color: 'bg-blue-500'
  },
  {
    value: GOALS.FLEXIBILITY,
    label: GOAL_LABELS[GOALS.FLEXIBILITY],
    description: GOAL_DESCRIPTIONS[GOALS.FLEXIBILITY],
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    color: 'bg-green-500'
  }
];

export default function GoalStep({ data, updateData, onNext }) {
  const [selected, setSelected] = useState(data.goal || '');

  const handleSelect = (value) => {
    setSelected(value);
    updateData('goal', value);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Qual e il tuo obiettivo?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Scegli il tuo obiettivo principale
        </p>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {GOAL_OPTIONS.map((option) => (
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${option.color}`}
              >
                {option.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-lg font-medium block ${
                  selected === option.value ? 'text-[var(--primary)]' : ''
                }`}>
                  {option.label}
                </span>
                <span className="text-sm text-[var(--text-secondary)] line-clamp-2">
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
