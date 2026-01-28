import { useState } from 'react';

export default function HeightStep({ data, updateData, onNext }) {
  const [height, setHeight] = useState(data.height || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const heightNum = parseInt(height);

    if (!height || isNaN(heightNum)) {
      setError('Inserisci la tua altezza');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      setError('Inserisci un\'altezza valida (100-250 cm)');
      return;
    }

    updateData('height', heightNum);
    onNext();
  };

  // Quick select heights
  const quickHeights = [160, 165, 170, 175, 180];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Quanto sei alto?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Serve per calcolare il tuo BMI
        </p>

        {/* Quick select */}
        <div className="flex justify-center gap-2 mb-6">
          {quickHeights.map((h) => (
            <button
              key={h}
              onClick={() => {
                setHeight(h.toString());
                setError('');
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                parseInt(height) === h
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:bg-[var(--primary)]/10'
              }`}
            >
              {h}
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
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setError('');
                  }}
                  placeholder="170"
                  min="100"
                  max="250"
                  className={`w-32 px-4 py-4 pr-12 text-3xl font-bold text-center rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                    error
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[var(--border)] focus:border-[var(--primary)]'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg">
                  cm
                </span>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          {/* Visual height indicator */}
          <div className="flex items-end justify-center gap-4 mb-8 h-32">
            <div className="relative w-16 bg-[var(--surface-hover)] rounded-t-lg" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-[var(--primary)]/30 rounded-t-lg transition-all"
                style={{ height: `${Math.min(100, Math.max(0, ((parseInt(height) || 170) - 100) / 1.5))}%` }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <svg width="24" height="24" fill="var(--primary)" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              {/* Ruler marks */}
              {[150, 170, 190].map((mark) => (
                <div
                  key={mark}
                  className="absolute left-full ml-2 flex items-center"
                  style={{ bottom: `${((mark - 100) / 1.5)}%` }}
                >
                  <div className="w-2 h-px bg-[var(--border)]"></div>
                  <span className="text-xs text-[var(--text-muted)] ml-1">{mark}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!height}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua
          </button>
        </form>
      </div>
    </div>
  );
}
