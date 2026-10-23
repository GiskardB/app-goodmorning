// Coach motivazionale: poche frasi, nei momenti giusti, mai a raffica.
// Principi: riconoscere lo sforzo e dare informazioni utili (self-talk motivazionale, Blanchfield 2014),
// evitare il tono "controllante" che riduce la motivazione autonoma (Teixeira 2012),
// chiudere bene la seduta (peak-end rule). Massimo una frase ogni 2 minuti, nessuna ripetizione.

export const COACH_MIN_GAP = 120;      // secondi tra due frasi
export const COACH_MAX_PER_SESSION = 6;
export const COACH_SHOW_SECONDS = 20;  // durata del messaggio a schermo (copre preparazione + inizio esercizio)

const PHRASES = {
  // Avvio della parte principale (solo giorni di forza)
  start: [
    'Quindici minuti. Tutto qui.',
    'Primo giro: prendi il ritmo, non il record.',
    'Oggi conta esserci. Il resto viene da sé.',
    'Esercizi che conosci. Falli bene, non in fretta.',
    'Si parte, {name}. Un esercizio alla volta.',
  ],
  // Riposo a metà seduta
  halfway: [
    'Metà fatta. Stessi esercizi: li conosci già.',
    'Primo giro chiuso. Il secondo è quello che fa la differenza.',
    'Respira. Il secondo giro è una ripetizione, non una novità.',
    'Cinque esercizi fatti, cinque da fare. Siamo in discesa.',
    'Bene, {name}. Bevi un sorso e ripartiamo.',
  ],
  halfwaySoft: [
    'Metà fatta. Oggi va benissimo così: finiamo con calma.',
    'Secondo giro leggero. Tecnica pulita, niente di più.',
    'Hai già fatto la parte difficile: presentarti.',
  ],
  // Esercizio più difficile della seduta
  hardest: [
    "Questo è l'esercizio più tosto di oggi. Poi è tutta discesa.",
    'Il più difficile della seduta. Qualità, non quantità.',
    'Qui vale la pena rallentare: ogni ripetizione pulita conta doppio.',
    'Lo sforzo che senti adesso è quello che costruisce.',
  ],
  // Ultimi 10 secondi di una tenuta
  holdLast10: [
    'Dieci secondi. Respira, non trattenere.',
    'Ultimi dieci: spalle lontane dalle orecchie.',
    'Ci sei. Dieci secondi e molli.',
    'Tieni la linea: glutei stretti, sguardo giù.',
    'Quasi. Non cedere con le anche.',
  ],
  // Ultimo esercizio
  lastExercise: [
    "Ultimo. Fallo come il primo.",
    'Ultimo esercizio: finisci bene, è quello che ricordi.',
    "L'ultimo è quello che resta in memoria. Puliscilo.",
    'Un esercizio e la seduta è tua, {name}.',
  ],
  lastExerciseSoft: [
    'Ultimo esercizio. Poi hai finito, davvero.',
    'Un ultimo sforzo tranquillo e chiudiamo.',
  ],
  // Fine seduta (schermata "Fantastico")
  end: [
    "Fatto. È così che si costruisce un'abitudine: una seduta alla volta.",
    'Seduta chiusa. Domani le gambe ringrazieranno.',
    'Hai mantenuto la promessa che ti sei fatto. Vale più dei muscoli.',
    "Un'altra seduta nel conto. Il corpo si adatta solo a quello che ripeti.",
  ],
  endSoft: [
    'Con poca energia hai fatto comunque la seduta. Questo è carattere.',
    'Giornata storta, seduta fatta. È così che si resta in piedi.',
  ],
  endMinimal: [
    'Otto minuti valgono più di zero. Hai tenuto il filo.',
    'Minimo vitale fatto: la catena non si è spezzata.',
  ],
  endTest: [
    'Test registrato. Tra quattro settimane vedrai i numeri salire.',
    "Il test non è una gara: è una fotografia. La prossima sarà migliore.",
  ],
  // Tapis roulant
  runMid: [
    'Metà del tratto. Spalle rilassate, braccia che oscillano.',
    'Sei a metà. Se parli a frasi intere, il ritmo è giusto.',
    'Metà fatta. Passi corti e leggeri, non lunghi.',
    'A metà strada, {name}. Il respiro ti dice tutto: se affanna, rallenta.',
  ],
  runLastMinute: [
    'Ultimo minuto di corsa. Resta sciolto, non accelerare.',
    'Un minuto e cammini. Mantieni il passo, non il fiato corto.',
    'Ultimo minuto: sguardo avanti, mani morbide.',
    'Sessanta secondi. Ce li hai.',
  ],
  walkMid: [
    'Metà del tratto. Braccia che spingono, passo deciso.',
    'Sei a metà. Spalle sopra i fianchi, mani libere.',
    'Metà fatta. Cento passi al minuto: senti il ritmo.',
  ],
  milestone: {
    5: ['Cinque minuti di corsa di fila. Prima settimana, già un traguardo.', 'Cinque minuti continui: un mese fa non c’erano.'],
    10: ['Dieci minuti di corsa senza fermarti. Questo è correre.', 'Dieci minuti continui. Ricordi i tratti da un minuto?'],
    15: ['Quindici minuti di corsa continua. Il grosso è fatto.', 'Un quarto d’ora di fila: il fiato c’è.'],
    20: ['Venti minuti continui. Da qui in poi è solo abitudine.', 'Venti minuti di corsa: traguardo vero.'],
    30: ['Trenta minuti di corsa continua. Sei un runner.', 'Mezz’ora di fila. Obiettivo del programma raggiunto.'],
  },
};

const pickFrom = (pool, used, name) => {
  if (!pool?.length) return null;
  const usable = pool.filter(p => !p.includes('{name}') || name);
  const fresh = usable.filter(p => !used.has(p));
  const list = fresh.length ? fresh : usable;
  if (!list.length) return null;
  const text = list[Math.floor(Math.random() * list.length)];
  used.add(text);
  return text.replace('{name}', name || '');
};

/**
 * Crea un coach per una singola seduta.
 * @param {object} opts
 * @param {boolean} opts.enabled  interruttore utente
 * @param {'normal'|'soft'|'minimal'|'off'} opts.tone  soft = check-in con energia bassa; minimal = minimo vitale (solo frase finale)
 * @param {string} opts.name  nome dell'utente (usato di rado)
 */
export function createCoach({ enabled = true, tone = 'normal', name = '' } = {}) {
  const used = new Set();
  const fired = new Set();
  let lastAt = -Infinity;
  let count = 0;
  const active = enabled && tone !== 'off';

  const poolFor = (trigger) => {
    if (tone === 'soft') {
      if (trigger === 'hardest' || trigger === 'holdLast10' || trigger === 'start') return null;
      return PHRASES[`${trigger}Soft`] || PHRASES[trigger];
    }
    return PHRASES[trigger];
  };

  return {
    /** Frase per un momento della seduta; null se il coach tace (gap, limite, già detta). */
    say(trigger, { elapsed = 0, force = false, key = trigger, variant = null } = {}) {
      if (!active || tone === 'minimal') return null;
      if (fired.has(key)) return null;
      if (!force && (elapsed - lastAt < COACH_MIN_GAP || count >= COACH_MAX_PER_SESSION)) return null;
      const pool = variant != null ? PHRASES[trigger]?.[variant] : poolFor(trigger);
      const text = pickFrom(pool, used, name);
      if (!text) return null;
      fired.add(key);
      lastAt = elapsed;
      count += 1;
      return text;
    },
    /** Frase di chiusura, sempre disponibile. */
    end({ test = false } = {}) {
      if (!enabled) return null;
      const pool = tone === 'minimal' ? PHRASES.endMinimal : test ? PHRASES.endTest : tone === 'soft' ? PHRASES.endSoft : PHRASES.end;
      return pickFrom(pool, used, name);
    },
  };
}

/** Traguardo (in minuti) raggiunto da un tratto di corsa continua di `seconds` secondi, o null. */
export const runMilestone = (seconds) => [30, 20, 15, 10, 5].find(m => seconds >= m * 60) || null;

/** True se l'esercizio è una tenuta isometrica. */
export const isHoldExercise = (ex) => Boolean(ex) && (ex.type === 'plank' || /hold|isometric|position|plank|superman$/.test(ex.exercise_id || ''));
