import { useState } from 'react';

export default function WeightStep({ data, updateData, onNext }) {
  const [weight, setWeight] = useState(data.weight || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const weightNum = parseFloat(weight);

    if (!weight || isNaN(weightNum)) {
      setError('Inserisci il tuo peso');
      return;
    }

    if (weightNum < 30 || weightNum > 250) {
      setError('Inserisci un peso valido (30-250 kg)');
      return;
    }

    updateData('weight', weightNum);
    onNext();
  };

  // Quick select weights
  const quickWeights = [50, 60, 70, 80, 90];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Quanto pesi?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Serve per calcolare le calorie bruciate
        </p>

        {/* Quick select */}
        <div className="flex justify-center gap-2 mb-6">
          {quickWeights.map((w) => (
            <button
              key={w}
              onClick={() => {
                setWeight(w.toString());
                setError('');
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                parseFloat(weight) === w
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--primary)]/10'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setError('');
                  }}
                  placeholder="70"
                  min="30"
                  max="250"
                  step="0.1"
                  className={`w-32 px-4 py-4 pr-12 text-3xl font-bold text-center rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[var(--border)] focus:border-[var(--primary)]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg">
                  kg
                </span>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          {/* Slider */}
          <div className="mb-8">
            <input
              type="range"
              min="30"
              max="150"
              value={weight || 70}
              onChange={(e) => {
                setWeight(e.target.value);
                setError('');
              }}
              className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>30 kg</span>
              <span>150 kg</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!weight}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua
          </button>
        </form>
      </div>
    </div>
  );
}
