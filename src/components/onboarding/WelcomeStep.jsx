export default function WelcomeStep({ onNext }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex flex-col items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        {/* Logo/Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">Benvenuto!</h1>

        {/* Subtitle */}
        <p className="text-lg text-white/80 mb-2">
          Good Morning Fitness
        </p>

        {/* Description */}
        <p className="text-white/60 mb-12 max-w-xs mx-auto">
          Il tuo percorso di 28 giorni verso una versione migliore di te stesso inizia ora.
        </p>

        {/* Features */}
        <div className="space-y-4 mb-12 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-sm">Allenamenti personalizzati</span>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <span className="text-sm">Monitoraggio dei progressi</span>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-sm">Adattamento intelligente</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onNext}
          className="w-full max-w-xs bg-white text-[var(--primary)] font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          Iniziamo!
        </button>

        <p className="text-xs text-white/40 mt-6">
          Ci vorranno solo 2 minuti
        </p>
      </div>
    </div>
  );
}
