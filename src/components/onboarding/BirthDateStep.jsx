import { useState, useEffect } from 'react';
import { calculateAge } from '../../utils/calculations';

export default function BirthDateStep({ data, updateData, onNext }) {
  // Parse existing date if available
  const parseExistingDate = (isoDate) => {
    if (!isoDate) return { day: '', month: '', year: '' };
    const date = new Date(isoDate);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      year: date.getFullYear().toString()
    };
  };

  const existingParts = parseExistingDate(data.birthDate);
  const [day, setDay] = useState(existingParts.day);
  const [month, setMonth] = useState(existingParts.month);
  const [year, setYear] = useState(existingParts.year);
  const [error, setError] = useState('');

  // Construct ISO date from parts
  const getIsoDate = () => {
    if (day && month && year && year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return null;
  };

  const isoDate = getIsoDate();
  const age = isoDate ? calculateAge(isoDate) : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!day || !month || !year) {
      setError('Inserisci la data completa');
      return;
    }

    if (year.length !== 4) {
      setError('Inserisci l\'anno con 4 cifre');
      return;
    }

    const dateStr = getIsoDate();
    if (!dateStr) {
      setError('Data non valida');
      return;
    }

    // Validate the date is real
    const testDate = new Date(dateStr);
    if (isNaN(testDate.getTime())) {
      setError('Data non valida');
      return;
    }

    const calculatedAge = calculateAge(dateStr);

    if (calculatedAge < 14) {
      setError('Devi avere almeno 14 anni per utilizzare l\'app');
      return;
    }

    if (calculatedAge > 100) {
      setError('Verifica la data inserita');
      return;
    }

    updateData('birthDate', dateStr);
    onNext();
  };

  // Auto-focus next input
  const handleDayChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setDay(value);
    setError('');
    if (value.length === 2) {
      document.getElementById('month-input')?.focus();
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(value);
    setError('');
    if (value.length === 2) {
      document.getElementById('year-input')?.focus();
    }
  };

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(value);
    setError('');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Quando sei nato?</h2>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          La tua eta ci aiuta a personalizzare gli allenamenti
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm text-[var(--text-secondary)] text-center mb-3">
              Inserisci nel formato GG/MM/AAAA
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                id="day-input"
                type="text"
                inputMode="numeric"
                value={day}
                onChange={handleDayChange}
                placeholder="GG"
                maxLength={2}
                className={`w-16 px-2 py-4 text-xl font-bold text-center rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                }`}
              />
              <span className="text-2xl text-[var(--text-muted)]">/</span>
              <input
                id="month-input"
                type="text"
                inputMode="numeric"
                value={month}
                onChange={handleMonthChange}
                placeholder="MM"
                maxLength={2}
                className={`w-16 px-2 py-4 text-xl font-bold text-center rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                }`}
              />
              <span className="text-2xl text-[var(--text-muted)]">/</span>
              <input
                id="year-input"
                type="text"
                inputMode="numeric"
                value={year}
                onChange={handleYearChange}
                placeholder="AAAA"
                maxLength={4}
                className={`w-24 px-2 py-4 text-xl font-bold text-center rounded-xl border-2 bg-[var(--surface)] transition-colors outline-none ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[var(--border)] focus:border-[var(--primary)]'
                }`}
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          {/* Age display */}
          {age !== null && age >= 14 && (
            <div className="text-center mb-6 p-4 bg-[var(--primary)]/10 rounded-xl">
              <span className="text-3xl font-bold text-[var(--primary)]">{age}</span>
              <span className="text-[var(--text-secondary)] ml-2">anni</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!day || !month || !year || year.length !== 4}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continua
          </button>
        </form>
      </div>
    </div>
  );
}
