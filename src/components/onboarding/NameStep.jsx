import { useState } from 'react';

export default function NameStep({ data, updateData, onNext }) {
  const [name, setName] = useState(data.name || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Inserisci il tuo nome');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Il nome deve avere almeno 2 caratteri');
      return;
    }

    updateData('name', trimmedName);
    onNext();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Come ti chiami?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Useremo il tuo nome per personalizzare l'esperienza
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Il tuo nome"
              autoFocus
              className={`w-full px-4 py-4 text-lg rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                error
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-[var(--border)] focus:border-[var(--primary)]'
              }`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua
          </button>
        </form>
      </div>
    </div>
  );
}
