import { calculateAge, calculateBMI, getBMICategory } from '../../utils/calculations';
import { formatGender, formatGoal, formatExperience, formatCondition, formatList } from '../../utils/formatters';

export default function SummaryStep({ data, onComplete, onPrevious }) {
  const age = data.birthDate ? calculateAge(data.birthDate) : null;
  const bmi = calculateBMI(data.weight, data.height);
  const bmiCategory = getBMICategory(bmi);

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6">
      <div className="flex-1 max-w-md mx-auto w-full pt-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="40" height="40" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Perfetto, {data.name}!</h2>
          <p className="text-[var(--text-secondary)]">
            Ecco il riepilogo del tuo profilo
          </p>
        </div>

        {/* Profile Summary Card */}
        <div className="card p-5 mb-6">
          {/* Basic Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
            <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold">
              {data.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{data.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {formatGender(data.gender)} - {age} anni
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-4 border-b border-[var(--border)]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">{data.weight}</div>
              <div className="text-xs text-[var(--text-secondary)]">kg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary)]">{data.height}</div>
              <div className="text-xs text-[var(--text-secondary)]">cm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: bmiCategory.color }}>{bmi}</div>
              <div className="text-xs text-[var(--text-secondary)]">BMI</div>
            </div>
          </div>

          {/* BMI Category */}
          <div className="py-4 border-b border-[var(--border)]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Categoria BMI</span>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${bmiCategory.color}20`, color: bmiCategory.color }}
              >
                {bmiCategory.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Obiettivo</span>
              <span className="text-sm font-medium">{formatGoal(data.goal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Livello</span>
              <span className="text-sm font-medium">{formatExperience(data.experience)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-[var(--text-secondary)]">Limitazioni</span>
              <span className="text-sm font-medium text-right max-w-[60%]">
                {data.conditions?.length > 0
                  ? formatList(data.conditions, formatCondition)
                  : 'Nessuna'}
              </span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-[var(--primary)]/10 rounded-xl p-4 mb-8">
          <h4 className="font-semibold text-[var(--primary)] mb-2">Cosa ti aspetta</h4>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              28 giorni di allenamenti personalizzati
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Progressione adattiva al tuo ritmo
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Monitoraggio della tua forma fisica
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            className="btn-primary w-full py-4 text-lg"
          >
            Inizia il programma!
          </button>
          <button
            onClick={onPrevious}
            className="w-full py-3 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
          >
            Modifica informazioni
          </button>
        </div>
      </div>
    </div>
  );
}
