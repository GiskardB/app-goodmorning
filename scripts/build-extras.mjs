#!/usr/bin/env node
// Sessioni extra — genera public/extra_sessions.json.
// Tre famiglie nate dalla valutazione dell'app (docs/VALUTAZIONE_APP.md):
//  - Cardio a corpo libero a basso impatto: copre l'aerobico per chi non ha il tapis roulant (OMS 2020:
//    150-300 min/sett). Niente salti, un piede sempre a terra, intensità moderata (sforzo 4-7 su 10):
//    sopra la soglia ventilatoria il piacere cala e con lui l'aderenza (Ekkekakis 2011).
//  - Pause attive: interrompere la sedentarietà (Dunstan 2012) e "exercise snacks" (Jenkins 2019, Islam 2022).
//  - Respiro e rilassamento: respirazione lenta a circa 6 atti al minuto (Zaccaro 2018, Laborde 2019).
// Le sessioni sono riprodotte dal motore degli allenamenti: `prep` è la transizione prima dell'esercizio
// e fa da recupero (es. 40 s di lavoro + 20 s di prep = rapporto 2:1).
// Uso: node scripts/build-extras.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EX = JSON.parse(readFileSync(join(ROOT, 'public/exercises.json'), 'utf8'));

// esercizio: id, secondi, opzioni { prep, label, cue, prepLabel, pace }
const x = (exercise_id, duration, o = {}) => ({ exercise_id, duration, ...o });
const RECOVER = 'Recupera camminando sul posto';
const PACE = { in: 4, out: 6 }; // 6 respiri al minuto, espirazione più lunga
const BREATH_CUE = 'Inspira dal naso per quattro secondi, espira lentamente per sei. Spalle morbide, pancia che si gonfia. Segui il cerchio.';

// Blocco a intervalli: ogni esercizio dura `work` secondi, preceduto da `rest` secondi di recupero
const intervals = (ids, work, rest, opts = {}) => ids.map((id, i) => x(id, work, { prep: i === 0 && opts.firstPrep ? opts.firstPrep : rest, prepLabel: rest >= 15 ? RECOVER : undefined, ...(opts.over?.[id] || {}) }));
const clean = (list) => list.map(e => Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined)));

const HALF_SQUAT = { label: 'Mezzo squat a ritmo', cue: 'Scendi solo fin dove ti è comodo e risali subito, a ritmo regolare. Le braccia accompagnano il movimento.' };
const WARM = [x('march_in_place', 60, { label: 'Marcia sul posto (riscaldamento)' }), x('arm_circles', 30, { prep: 5 }), x('bodyweight_squat', 30, { prep: 5, label: 'Mezzo squat lento', cue: 'Mezzo squat lento e controllato per scaldare ginocchia e anche.' })];
const COOL = [x('march_in_place', 60, { prep: 10, label: 'Marcia lenta (defaticamento)', cue: 'Cammina piano sul posto lasciando scendere il respiro.' }), x('standing_overhead_reach', 30, { prep: 5 }), x('chest_stretch', 20, { prep: 5 })];

const families = [
  {
    id: 'cardio', name: 'Cardio a corpo libero', theme: 'cardio', coach: true, countsAsActive: true,
    description: 'Cardio in casa senza attrezzi e senza salti: un piede resta sempre a terra, quindi niente rumore e poco impatto sulle articolazioni.',
    why: 'Il piano di forza da solo non copre i 150 minuti settimanali di attività aerobica indicati dall’OMS. Due o tre sedute nei giorni leggeri colmano il vuoto.',
    hint: 'Sei tu a regolare l’intensità con ampiezza e velocità del movimento. Devi riuscire a parlare a frasi: se ansimi, rallenta.',
    sessions: [
      {
        id: 'cardio_1', name: 'Livello 1 · Dolce', level: 1, met: 4.0, effort: 'Sforzo 4-5 su 10',
        focus: '8 tratti da 30 secondi, con 30 secondi di recupero',
        why: 'Lavoro e recupero alla pari: il modo più sicuro di iniziare e di finire con la voglia di rifarlo.',
        exercises: [
          WARM[0],
          ...intervals(['step_jack', 'standing_high_knee', 'shadow_boxing', 'bodyweight_squat', 'step_jack', 'standing_high_knee', 'shadow_boxing', 'bodyweight_squat'], 30, 30, { firstPrep: 10, over: { bodyweight_squat: HALF_SQUAT } }),
          x('march_in_place', 40, { prep: 10, label: 'Marcia lenta (defaticamento)', cue: 'Cammina piano sul posto lasciando scendere il respiro.' }),
          x('standing_overhead_reach', 20, { prep: 5 }),
        ],
      },
      {
        id: 'cardio_2', name: 'Livello 2 · Medio', level: 2, met: 5.0, effort: 'Sforzo 5-6 su 10',
        focus: '2 giri di 5 esercizi: 40 secondi di lavoro, 20 di recupero',
        why: 'Il recupero si accorcia e compaiono movimenti più ampi: il battito resta alto più a lungo, senza salti.',
        exercises: [
          ...WARM,
          ...intervals(['step_jack', 'front_kick', 'skater_step', 'shadow_boxing', 'squat_heel_raise'], 40, 20),
          ...intervals(['step_jack', 'front_kick', 'skater_step', 'shadow_boxing', 'squat_heel_raise'], 40, 20),
          ...COOL,
        ],
      },
      {
        id: 'cardio_3', name: 'Livello 3 · Vivace', level: 3, met: 5.8, effort: 'Sforzo 6-7 su 10, mai al massimo',
        focus: '3 giri di 4 esercizi: 45 secondi di lavoro, 15 di recupero',
        why: 'Tre giri con un minuto di marcia in mezzo: il lavoro più impegnativo, sempre a un ritmo che controlli tu.',
        exercises: [
          ...WARM,
          ...intervals(['skater_step', 'squat_kickback', 'front_kick', 'shadow_boxing'], 45, 15),
          x('march_in_place', 60, { prep: 5, label: 'Marcia sul posto (recupero)', cue: 'Un minuto di marcia tranquilla prima del prossimo giro.' }),
          ...intervals(['skater_step', 'squat_kickback', 'front_kick', 'shadow_boxing'], 45, 15),
          x('march_in_place', 60, { prep: 5, label: 'Marcia sul posto (recupero)', cue: 'Un minuto di marcia tranquilla prima dell’ultimo giro.' }),
          ...intervals(['skater_step', 'squat_kickback', 'front_kick', 'shadow_boxing'], 45, 15),
          ...COOL,
        ],
      },
    ],
  },
  {
    id: 'pausa', name: 'Pause attive', theme: 'light', coach: false, countsAsActive: false,
    description: 'Tre o quattro minuti per spezzare le ore seduti. In abiti normali, accanto alla scrivania, senza sudare.',
    why: 'Interrompere la sedentarietà con brevi pause migliora la risposta di zuccheri e insulina dopo i pasti, e ogni minuto di movimento conta.',
    hint: 'Una pausa ogni ora seduti è già un ottimo ritmo. Non sostituisce l’allenamento: lo affianca.',
    sessions: [
      {
        id: 'pausa_sedia', name: 'Sblocca-sedia', level: 1, met: 3.0, effort: 'Sforzo 3 su 10',
        focus: 'Marcia, alzate dalla sedia, polpacci e spalle',
        why: 'Riattiva gambe e schiena dopo un’ora seduti.',
        exercises: [
          x('march_in_place', 60, { prep: 5 }), x('chair_squat', 30, { prep: 5 }), x('calf_raise', 30, { prep: 5 }),
          x('wall_slide', 30, { prep: 5 }), x('standing_overhead_reach', 30, { prep: 5 }),
        ],
      },
      {
        id: 'pausa_energia', name: 'Snack energia', level: 2, met: 5.0, effort: 'Tre spunti vivaci da 20 secondi', countsAsActive: true,
        focus: '3 × (20 secondi vivaci / 40 lenti)',
        why: 'Brevi spunti vivaci ripetuti nella giornata migliorano la forma cardiorespiratoria anche in chi non si allena.',
        exercises: [
          x('march_in_place', 30, { prep: 5 }),
          x('step_jack', 20, { prep: 5, label: 'Jack senza salto, veloce' }), x('march_in_place', 30, { prep: 5, label: 'Marcia lenta' }),
          x('standing_high_knee', 20, { prep: 5, label: 'Ginocchia alte, veloce' }), x('march_in_place', 30, { prep: 5, label: 'Marcia lenta' }),
          x('shadow_boxing', 20, { prep: 5, label: 'Pugilato a vuoto, veloce' }), x('march_in_place', 30, { prep: 5, label: 'Marcia lenta' }),
        ],
      },
      {
        id: 'pausa_forza', name: 'Forza-snack', level: 2, met: 3.8, effort: 'Sforzo 5 su 10',
        focus: '2 giri: alzate dalla sedia, push-up al muro, hip hinge',
        why: 'Sei serie brevi che si sommano al lavoro di forza della settimana.',
        exercises: [
          ...intervals(['chair_squat', 'push_up_wall', 'hip_hinge'], 30, 10, { firstPrep: 5 }),
          ...intervals(['chair_squat', 'push_up_wall', 'hip_hinge'], 30, 10),
        ],
      },
      {
        id: 'pausa_equilibrio', name: 'Equilibrio e respiro', level: 1, met: 2.0, effort: 'Sforzo 2 su 10',
        focus: 'Equilibrio su una gamba, poi 2 minuti di respiro lento',
        why: 'L’equilibrio si allena in pochi minuti e con l’età diventa prezioso. Il respiro lento chiude la pausa a mente più calma.',
        exercises: [
          x('single_leg_stand', 30, { prep: 5, label: 'Equilibrio su una gamba (sinistra)', cue: 'Stai su una gamba sola vicino a un appoggio. Sguardo su un punto fisso.' }),
          x('single_leg_stand', 30, { prep: 5, label: 'Equilibrio su una gamba (destra)', cue: 'Cambia gamba. Se è facile, prova a non toccare l’appoggio.' }),
          x('single_leg_stand', 30, { prep: 5, label: 'Equilibrio su una gamba (sinistra)', cue: 'Ancora la sinistra: prova a muovere lentamente la gamba sollevata.' }),
          x('single_leg_stand', 30, { prep: 5, label: 'Equilibrio su una gamba (destra)', cue: 'Ultimo lato. Respira tranquillo.' }),
          x('breathing_seated', 120, { prep: 8, label: 'Respiro lento', cue: BREATH_CUE, pace: PACE }),
        ],
      },
    ],
  },
  {
    id: 'respiro', name: 'Respiro e rilassamento', theme: 'recovery', coach: false, countsAsActive: false,
    description: 'Per la sera o dopo una giornata tesa: respiro lento e allungamenti dolci, da fare anche a letto.',
    why: 'Respirare a circa sei atti al minuto aumenta la variabilità cardiaca e il senso di rilassamento. Non è una cura per l’insonnia: è un modo per chiudere la giornata.',
    hint: 'Non conta nei minuti di cardio, ma conta per te. Nessun obiettivo: solo il respiro.',
    sessions: [
      {
        id: 'respiro_5', name: 'Respiro lento', level: 1, met: 1.3, effort: 'Nessuno sforzo',
        focus: '5 minuti a 6 respiri al minuto, seguendo il cerchio',
        why: 'Cinque minuti bastano per sentire il battito scendere.',
        exercises: [x('breathing_seated', 300, { prep: 8, label: 'Respiro lento', cue: BREATH_CUE, pace: PACE })],
      },
      {
        id: 'respiro_sera', name: 'Scarico serale', level: 1, met: 1.8, effort: 'Nessuno sforzo',
        focus: 'Allungamenti a terra e respiro lento da sdraiati',
        why: 'Scioglie schiena e anche prima di dormire, poi lascia la parola al respiro.',
        exercises: [
          x('child_pose', 45, { prep: 8 }), x('cat_cow_stretch', 45, { prep: 5 }), x('knees_to_chest_stretch', 45, { prep: 6 }),
          x('lying_leg_twist', 45, { prep: 5, cue: 'Lascia cadere lentamente le ginocchia da un lato e dall’altro, spalle a terra.' }),
          x('figure_4_stretch_left', 40, { prep: 6 }), x('figure_4_stretch_right', 40, { prep: 6 }),
          x('breathing_standing', 150, { prep: 8, label: 'Respiro lento da sdraiato', cue: BREATH_CUE, pace: PACE }),
        ],
      },
    ],
  },
];

// Normalizzazione e controlli
const missing = new Set();
for (const f of families) for (const s of f.sessions) {
  s.exercises = clean(s.exercises);
  for (const e of s.exercises) if (!EX[e.exercise_id]) missing.add(e.exercise_id);
  // durata reale: lavoro + transizioni (la prima usa 10 s se non indicata)
  const secs = s.exercises.reduce((a, e) => a + e.duration + (e.prep ?? 10), 0);
  s.minutes = Math.max(1, Math.round(secs / 60));
  s.countsAsActive = s.countsAsActive ?? f.countsAsActive;
  if (f.id === 'cardio') {
    const first = s.exercises[0], last = s.exercises[s.exercises.length - 1];
    if (first.exercise_id !== 'march_in_place' || first.duration < 60) throw new Error(`${s.id}: manca il riscaldamento`);
    if (EX[last.exercise_id].type === 'cardio') throw new Error(`${s.id}: manca il defaticamento`);
    // basso impatto: nessun esercizio con salto
    for (const e of s.exercises) if (/jump|burpee|running|high_knees$|plank_jack|sprint/.test(e.exercise_id)) throw new Error(`${s.id}: ${e.exercise_id} non è a basso impatto`);
  }
}
if (missing.size) { console.error('ID MANCANTI: ' + [...missing].join(', ')); process.exit(1); }
writeFileSync(join(ROOT, 'public/extra_sessions.json'), JSON.stringify({ families }, null, 2) + '\n');
for (const f of families) console.log(f.name.padEnd(26), f.sessions.map(s => `${s.name} ${s.minutes}′`).join(' | '));
console.log('OK');
