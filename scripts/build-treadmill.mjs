#!/usr/bin/env node
// Programmi tapis roulant — genera public/workout_treadmill.json.
// Basato su: NHS Couch-to-5K, Galloway run/walk, Jones & Doust 1996 (pendenza 1%),
// Compendium of Physical Activities, Ekkekakis (piacere sotto soglia ventilatoria),
// Helgerud 2007 (4×4), OMS 2020 (150-300 min/sett). Dettagli: docs/PIANO_TREADMILL.md
// Uso: node scripts/build-treadmill.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const M = (min) => Math.round(min * 60);

// Segmenti (durata in minuti, velocità km/h, pendenza % opzionale)
const walk = (min, speed = 5, incline = 0) => ({ activity: speed >= 6 ? 'Camminata svelta' : speed <= 4.2 ? 'Camminata lenta' : 'Camminata', speed, duration: M(min), ...(incline ? { incline } : {}) });
const climb = (min, incline, speed = 5) => ({ activity: `Salita ${incline}%`, speed, duration: M(min), incline });
const run = (min, speed = 7.5, incline = 0) => ({ activity: speed >= 9.5 ? 'Corsa veloce' : speed >= 8.5 ? 'Corsa' : 'Corsa leggera', speed, duration: M(min), ...(incline ? { incline } : {}) });
const rep = (n, ...segs) => Array.from({ length: n }, () => segs.map(s => ({ ...s }))).flat();
// Seduta: riscaldamento + corpo + defaticamento; unisce segmenti consecutivi identici
function S(name, focus, segs) {
  const out = [];
  for (const s of segs.flat()) {
    const last = out[out.length - 1];
    if (last && last.activity === s.activity && last.speed === s.speed && (last.incline || 0) === (s.incline || 0)) last.duration += s.duration;
    else out.push({ ...s });
  }
  const totalDuration = Math.round(out.reduce((a, s) => a + s.duration, 0) / 60);
  return { name, focus, totalDuration, segments: out };
}
const wu = (min = 5, speed = 5) => walk(min, speed);          // riscaldamento in cammino
const cd = (min = 5, speed = 4.5) => walk(min, speed);        // defaticamento, mai omesso

const LEGEND_WALK = [
  { level: 'Camminata lenta', speed: 4, feeling: 'Rilassato, respiro normale' },
  { level: 'Camminata', speed: 5, feeling: 'Tranquillo, parli con facilità' },
  { level: 'Camminata svelta', speed: 6, feeling: 'Un po’ impegnato, parli a frasi intere' },
  { level: 'Camminata svelta +', speed: 6.5, feeling: 'Respiro più profondo, frasi brevi' },
];
const LEGEND_RUN = [
  { level: 'Camminata', speed: 5, feeling: 'Tranquillo, parli con facilità' },
  { level: 'Camminata svelta', speed: 6, feeling: 'Un po’ impegnato, parli a frasi intere' },
  { level: 'Corsa leggera', speed: 7.5, feeling: 'Corsa “chiacchierabile”: frasi intere' },
  { level: 'Corsa', speed: 8.5, feeling: 'Respiro ritmico, frasi brevi' },
  { level: 'Corsa veloce', speed: 10, feeling: 'Solo 2-3 parole alla volta' },
];

const programs = [];

/* ───────────── (a) Da camminata a corsa — 10 sett ───────────── */
{
  const r = (min) => run(min, 7.5);
  const w = (min) => walk(min, 5.5);
  const weeks = [
    [ // 1 · ingresso: solo cammino, finire con "potevo fare di più"
      S('A · Tratti svelti', '6 tratti di camminata svelta', [wu(5, 4.5), rep(6, walk(1, 6), walk(2, 5)), cd(4)]),
      S('B · Cammino continuo', '20 minuti di camminata tranquilla', [wu(4, 4.5), walk(20, 5), cd(4)]),
      S('C · Tratti svelti +', '8 tratti svelti, recuperi più brevi', [wu(5, 4.5), rep(8, walk(1, 6), walk(1.5, 5)), cd(4)]),
    ],
    [ // 2 · prime corse: 1' corsa / 1'30'' cammino
      S('A · Corsa e cammino', '7 × (1′ corsa / 1′30″ cammino)', [wu(), rep(7, r(1), w(1.5)), cd()]),
      S('B · Versione corta', '6 × (1′ corsa / 1′30″ cammino)', [wu(), rep(6, r(1), w(1.5)), cd()]),
      S('C · Versione lunga', '8 × (1′ corsa / 1′30″ cammino)', [wu(), rep(8, r(1), w(1.5)), cd()]),
    ],
    [ // 3
      S('A · Corsa e cammino', '6 × (1′30″ corsa / 2′ cammino)', [wu(), rep(6, r(1.5), w(2)), cd()]),
      S('B · Versione corta', '5 × (1′30″ corsa / 2′ cammino)', [wu(), rep(5, r(1.5), w(2)), cd()]),
      S('C · Versione lunga', '6 × (1′30″ corsa / 1′30″ cammino)', [wu(), rep(6, r(1.5), w(1.5)), cd()]),
    ],
    [ // 4 · primi 3' continui
      S('A · Primi 3 minuti', '2 × (1′30″ corsa, 3′ corsa)', [wu(), rep(2, r(1.5), w(1.5), r(3), w(3)), cd()]),
      S('B · Versione corta', '4 × (2′ corsa / 2′ cammino)', [wu(), rep(4, r(2), w(2)), cd()]),
      S('C · Versione lunga', '1′30″, 3′, 1′30″, 4′ di corsa', [wu(), r(1.5), w(1.5), r(3), w(3), r(1.5), w(1.5), r(4), cd()]),
    ],
    [ // 5 · primi 5' continui
      S('A · Blocchi da 3-4 minuti', '3′, 3′, 4′, 3′ di corsa', [wu(), r(3), w(1.5), r(3), w(1.5), r(4), w(2), r(3), cd()]),
      S('B · Versione corta', '4 × (3′ corsa / 2′ cammino)', [wu(), rep(4, r(3), w(2)), cd()]),
      S('C · Primi 5 minuti', '3′, 5′, 3′, 5′ di corsa', [wu(), r(3), w(1.5), r(5), w(2.5), r(3), w(1.5), r(5), cd()]),
    ],
    [ // 6 · rampa dolce (il salto 8'→20' del C25K è smussato)
      S('A · Tre da 5', '3 × (5′ corsa / 3′ cammino)', [wu(), rep(3, r(5), w(3)), cd()]),
      S('B · Due da 8', '2 × (8′ corsa / 5′ cammino)', [wu(), rep(2, r(8), w(5)), cd()]),
      S('C · Primi 10 minuti', '10′ corsa, 3′ cammino, 8′ corsa', [wu(), r(10), w(3), r(8), cd()]),
    ],
    [ // 7
      S('A · Piramide', '5′, 8′, 5′ di corsa', [wu(), r(5), w(3), r(8), w(3), r(5), cd()]),
      S('B · Due da 10', '2 × (10′ corsa / 3′ cammino)', [wu(), rep(2, r(10), w(3)), cd()]),
      S('C · Primi 15 minuti', '15′ corsa, 3′ cammino, 5′ corsa', [wu(), r(15), w(3), r(5), cd()]),
    ],
    [ // 8 · scarico leggero + traguardo 20'
      S('A · Scarico', '2 × (8′ corsa / 3′ cammino)', [wu(), rep(2, r(8), w(3)), cd()]),
      S('B · 12 + 8', '12′ corsa, 3′ cammino, 8′ corsa', [wu(), r(12), w(3), r(8), cd()]),
      S('C · Traguardo: 20 minuti', '20′ di corsa continua', [wu(), r(20), cd()]),
    ],
    [ // 9
      S('A · 22 continui', '22′ di corsa continua', [wu(), r(22), cd()]),
      S('B · Due da 12', '2 × (12′ corsa / 2′ cammino)', [wu(), rep(2, r(12), w(2)), cd()]),
      S('C · 25 continui', '25′ di corsa continua (1% opzionale)', [wu(), r(25), cd()]),
    ],
    [ // 10
      S('A · 25 continui', '25′ di corsa continua', [wu(), r(25), cd()]),
      S('B · Due da 14', '2 × (14′ corsa / 2′ cammino)', [wu(), rep(2, r(14), w(2)), cd()]),
      S('C · Traguardo: 30 minuti', '30′ di corsa continua ≈ 4-5 km', [wu(), r(30), cd()]),
    ],
  ];
  programs.push({
    id: 'soft_couch_to_run', name: 'Da camminata a corsa', icon: '🚶‍♂️',
    description: 'Dal divano a 30 minuti di corsa continua in 10 settimane, con pause di cammino programmate.',
    difficulty: 'Principiante', totalWeeks: 10, sessionsPerWeek: 3,
    prerequisite: 'Nessuno: si parte camminando.',
    phases: [
      { name: 'Ingresso', weeks: [1], description: 'Solo cammino: prendi confidenza col tapis' },
      { name: 'Prime corse', weeks: [2, 3, 4, 5], description: 'Tratti di corsa brevi, cammino tra uno e l’altro' },
      { name: 'Corse più lunghe', weeks: [6, 7, 8], description: 'Blocchi da 5 a 20 minuti, rampa dolce' },
      { name: 'Corsa continua', weeks: [9, 10], description: 'Fino a 30 minuti senza fermarti' },
    ],
    tips: [
      'Le pause di cammino sono parte del piano, non un fallimento.',
      'Velocità giusta = riesci a parlare a frasi intere. Se ansimi, rallenta.',
      'Ripetere una settimana è previsto: passa alla successiva solo quando le 3 sedute ti sono sembrate gestibili.',
      'Tre sedute a settimana, mai in giorni consecutivi.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (b) Camminata attiva — 8 sett ───────────── */
{
  const weeks = [
    [S('A · Base', '15′ di camminata tranquilla', [wu(3, 4), walk(15, 4.5), cd(3, 4)]),
     S('B · Corta', '12′ di camminata', [wu(3, 4), walk(12, 5), cd(3, 4)]),
     S('C · Lunga', '18′ di camminata tranquilla', [wu(3, 4), walk(18, 4.5), cd(3, 4)])],
    [S('A · Base', '18′ di camminata', [wu(3, 4), walk(18, 5), cd(3, 4)]),
     S('B · Corta', '15′ di camminata', [wu(3, 4), walk(15, 5), cd(3, 4)]),
     S('C · Lunga', '20′ di camminata', [wu(3, 4), walk(20, 5), cd(3, 4)])],
    [S('A · Tratti svelti', '6 × (2′ svelta / 2′ normale)', [wu(5, 4.5), rep(6, walk(2, 6), walk(2, 5)), cd(5, 4.5)]),
     S('B · Media', '20′ a passo deciso', [wu(5, 4.5), walk(20, 5.5), cd(5, 4.5)]),
     S('C · Lunga', '25′ a passo deciso', [wu(5, 4.5), walk(25, 5.5), cd(5, 4.5)])],
    [S('A · Scarico', '15′ a passo deciso', [wu(5, 4.5), walk(15, 5.5), cd(5, 4.5)]),
     S('B · Scarico', '15′ di camminata', [wu(5, 4.5), walk(15, 5), cd(5, 4.5)]),
     S('C · Scarico lunga', '18′ a passo deciso', [wu(5, 4.5), walk(18, 5.5), cd(5, 4.5)])],
    [S('A · Svelta continua', '20′ di camminata svelta', [wu(5, 4.5), walk(20, 6), cd(5, 4.5)]),
     S('B · Tratti svelti', '8 × (2′ svelta+ / 1′ normale)', [wu(5, 4.5), rep(8, walk(2, 6.5), walk(1, 5.5)), cd(5, 4.5)]),
     S('C · Svelta in leggera salita', '20′ svelta al 2%', [wu(5, 4.5), walk(20, 6, 2), cd(5, 4.5)])],
    [S('A · Svelta continua', '25′ di camminata svelta', [wu(5, 4.5), walk(25, 6), cd(5, 4.5)]),
     S('B · Tratti svelti', '6 × (3′ svelta+ / 2′ normale)', [wu(5, 4.5), rep(6, walk(3, 6.5), walk(2, 5.5)), cd(5, 4.5)]),
     S('C · Svelta in salita', '25′ svelta al 3%', [wu(5, 4.5), walk(25, 6, 3), cd(5, 4.5)])],
    [S('A · Traguardo: 30 svelti', '30′ di camminata svelta', [wu(5, 4.5), walk(30, 6.5), cd(5, 4.5)]),
     S('B · Salita a tratti', '4 × (3′ al 4% / 3′ in piano)', [wu(5, 4.5), rep(4, walk(3, 6, 4), walk(3, 5.5)), cd(5, 4.5)]),
     S('C · Svelta continua', '30′ di camminata svelta', [wu(5, 4.5), walk(30, 6), cd(5, 4.5)])],
    [S('A · Svelta continua', '30′ di camminata svelta', [wu(5, 4.5), walk(30, 6.5), cd(5, 4.5)]),
     S('B · Salita a tratti', '5 × (3′ al 4% / 3′ in piano)', [wu(5, 4.5), rep(5, walk(3, 6, 4), walk(3, 5.5)), cd(5, 4.5)]),
     S('C · Svelta in salita', '30′ svelta al 2%', [wu(5, 4.5), walk(30, 6.5, 2), cd(5, 4.5)])],
  ];
  programs.push({
    id: 'active_walk', name: 'Camminata attiva', icon: '🥾',
    description: 'Da 20 a 40 minuti di camminata svelta in 8 settimane, senza mai correre. Ideale per ricominciare a muoversi.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 3,
    prerequisite: 'Nessuno.',
    phases: [
      { name: 'Base', weeks: [1, 2], description: 'Abitudine prima dell’intensità' },
      { name: 'Ritmo', weeks: [3, 4], description: 'Tratti svelti, poi settimana di scarico' },
      { name: 'Svelta', weeks: [5, 6], description: 'Camminata svelta continua e prime salite' },
      { name: 'Svelta e salita', weeks: [7, 8], description: '30 minuti svelti, salita a tratti' },
    ],
    tips: [
      'Cadenza da camminata svelta: circa 100 passi al minuto, braccia che oscillano.',
      'In salita mani libere: aggrapparsi al corrimano annulla il lavoro.',
      'Se una seduta è sembrata dura, ripeti la settimana: la progressione non scappa.',
    ],
    speedLegend: LEGEND_WALK, weeks,
  });
}

/* ───────────── (c) Dimagrimento — 8 sett, 4 sedute ───────────── */
{
  const z2 = (min, speed = 6) => walk(min, speed);
  const INT = (n, on = 1, off = 2, speed = 7.5) => rep(n, run(on, speed), walk(off, 5.5));
  const weeks = [
    [S('A · Zona 2', '20′ a ritmo “chiacchierabile”', [wu(), z2(20), cd()]),
     S('B · Intervalli dolci', '6 × (1′ corsa leggera / 2′ cammino)', [wu(), INT(6), cd()]),
     S('C · Zona 2 lunga', '25′ a ritmo “chiacchierabile”', [wu(), z2(25), cd()]),
     S('D · Salita dolce', '15′ al 4% a passo normale', [wu(), climb(15, 4), cd()])],
    [S('A · Zona 2', '25′ a ritmo “chiacchierabile”', [wu(), z2(25), cd()]),
     S('B · Intervalli dolci', '8 × (1′ corsa leggera / 2′ cammino)', [wu(), INT(8), cd()]),
     S('C · Zona 2 lunga', '30′ a ritmo “chiacchierabile”', [wu(), z2(30), cd()]),
     S('D · Salita dolce', '25′ al 4%', [wu(), climb(25, 4), cd()])],
    [S('A · Zona 2', '30′ a ritmo “chiacchierabile”', [wu(), z2(30), cd()]),
     S('B · Intervalli dolci', '10 × (1′ corsa leggera / 2′ cammino)', [wu(), INT(10), cd()]),
     S('C · Zona 2 lunga', '35′ a ritmo “chiacchierabile”', [wu(), z2(35), cd()]),
     S('D · Salita', '30′ al 5%', [wu(), climb(30, 5), cd()])],
    [S('A · Scarico', '20′ zona 2', [wu(), z2(20), cd()]),
     S('B · Scarico', '25′ zona 2, niente intervalli', [wu(), z2(25), cd()]),
     S('C · Scarico', '25′ zona 2', [wu(), z2(25), cd()]),
     S('D · Scarico in salita', '20′ al 3%', [wu(), climb(20, 3), cd()])],
    [S('A · Zona 2', '35′ a ritmo “chiacchierabile”', [wu(), z2(35, 6.5), cd()]),
     S('B · Intervalli', '10 × (1′30″ corsa leggera / 1′30″ cammino)', [wu(), INT(10, 1.5, 1.5), cd()]),
     S('C · Zona 2 lunga', '40′ a ritmo “chiacchierabile”', [wu(), z2(40, 6.5), cd()]),
     S('D · Salita', '35′ al 5%', [wu(), climb(35, 5), cd()])],
    [S('A · Zona 2', '38′ a ritmo “chiacchierabile”', [wu(), z2(38, 6.5), cd()]),
     S('B · Intervalli', '12 × (1′30″ corsa leggera / 1′30″ cammino)', [wu(), INT(12, 1.5, 1.5), cd()]),
     S('C · Zona 2 lunga', '45′ a ritmo “chiacchierabile”', [wu(), z2(45, 6.5), cd()]),
     S('D · Salita', '40′ al 6%', [wu(), climb(40, 6), cd()])],
    [S('A · Zona 2', '40′ a ritmo “chiacchierabile”', [wu(), z2(40, 6.5), cd()]),
     S('B · Intervalli', '9 × (2′ corsa / 2′ cammino)', [wu(), INT(9, 2, 2, 8), cd()]),
     S('C · Zona 2 lunga', '45′ a ritmo “chiacchierabile”', [wu(), z2(45, 6.5), cd()]),
     S('D · Salita', '45′ al 6%', [wu(), climb(45, 6), cd()])],
    [S('A · Scarico', '25′ zona 2', [wu(), z2(25, 6.5), cd()]),
     S('B · Scarico', '25′ zona 2, niente intervalli', [wu(), z2(25, 6.5), cd()]),
     S('C · Scarico', '30′ zona 2', [wu(), z2(30, 6.5), cd()]),
     S('D · Scarico in salita', '25′ al 4%', [wu(), climb(25, 4), cd()])],
  ];
  programs.push({
    id: 'fat_loss', name: 'Dimagrimento', icon: '🔥',
    description: 'Minuti settimanali in crescita (120 → 210) a intensità piacevole: 3 sedute in zona 2 + 1 variata. È la costanza che fa dimagrire.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 4,
    prerequisite: 'Nessuno. Se corri già, alza la zona 2 a 7-8 km/h.',
    phases: [
      { name: 'Avvio', weeks: [1, 2], description: '120-150 minuti a settimana, tutto facile' },
      { name: 'Costruzione', weeks: [3, 4], description: '170 minuti, poi settimana di scarico' },
      { name: 'Volume', weeks: [5, 6, 7], description: '180-210 minuti a settimana' },
      { name: 'Consolidamento', weeks: [8], description: 'Scarico: mantieni l’abitudine' },
    ],
    tips: [
      'La “zona brucia-grassi” non esiste: contano le calorie totali della settimana, e le fai solo se continui.',
      'Zona 2 = parli a frasi intere. Se non riesci, rallenta: non è un cedimento, è il metodo.',
      'Obiettivo settimanale, non giornaliero: se salti una seduta, fanne una da 15′ entro due giorni. Mai saltarne due di fila.',
      'Intervalli e salita: al massimo una seduta impegnativa a settimana.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (d) Resistenza: 5 km continui — 8 sett ───────────── */
{
  const weeks = [
    [S('A · Corsa facile', '25′ di corsa', [wu(), run(25, 8), cd()]),
     S('B · Corsa facile', '28′ di corsa', [wu(), run(28, 8), cd()]),
     S('C · Lunga', '30′ di corsa leggera', [wu(), run(30, 7.5), cd()])],
    [S('A · Corsa facile', '25′ di corsa', [wu(), run(25, 8), cd()]),
     S('B · Corsa facile', '30′ di corsa', [wu(), run(30, 8), cd()]),
     S('C · Lunga', '33′ di corsa leggera', [wu(), run(33, 7.5), cd()])],
    [S('A · Variazioni di ritmo', '6 × (2′ corsa / 2′ leggera)', [wu(), rep(6, run(2, 9), run(2, 7.5)), cd()]),
     S('B · Corsa all’1%', '30′ di corsa con 1% di pendenza', [wu(), run(30, 8, 1), cd()]),
     S('C · Lunga', '35′ di corsa leggera', [wu(), run(35, 7.5), cd()])],
    [S('A · Variazioni di ritmo', '7 × (2′ corsa / 2′ leggera)', [wu(), rep(7, run(2, 9), run(2, 7.5)), cd()]),
     S('B · Corsa all’1%', '30′ di corsa con 1% di pendenza', [wu(), run(30, 8, 1), cd()]),
     S('C · Lunga', '38′ di corsa leggera', [wu(), run(38, 7.5), cd()])],
    [S('A · Scarico', '20′ di corsa', [wu(), run(20, 8), cd()]),
     S('B · Scarico', '25′ di corsa leggera', [wu(), run(25, 7.5), cd()]),
     S('C · Scarico', '25′ di corsa', [wu(), run(25, 8), cd()])],
    [S('A · Ritmo', '8 × (2′ veloce / 1′30″ leggera)', [wu(), rep(8, run(2, 9.5), run(1.5, 7.5)), cd()]),
     S('B · Finale in crescendo', '25′ di corsa + 5′ più veloci', [wu(), run(25, 8), run(5, 9), cd()]),
     S('C · Lunga', '40′ di corsa leggera', [wu(), run(40, 7.5), cd()])],
    [S('A · Ritmo', '8 × (2′ veloce / 1′30″ leggera)', [wu(), rep(8, run(2, 9.5), run(1.5, 7.5)), cd()]),
     S('B · Finale in crescendo', '25′ di corsa + 5′ veloci', [wu(), run(25, 8.5), run(5, 9.5), cd()]),
     S('C · Lunga', '42′ di corsa', [wu(), run(42, 8), cd()])],
    [S('A · Ritmo', '6 × (2′ veloce / 2′ leggera)', [wu(), rep(6, run(2, 10), run(2, 7.5)), cd()]),
     S('B · Corsa', '30′ di corsa', [wu(), run(30, 8.5), cd()]),
     S('C · Traguardo: 5 km', '45′ di corsa ≈ 6 km', [wu(), run(45, 8), cd()])],
  ];
  programs.push({
    id: 'endurance_5k', name: 'Resistenza: 5 km', icon: '🏃',
    description: 'Per chi corre già 20-30 minuti: una lunga che cresce di 3′ a settimana, una seduta di ritmo e una facile. Arrivi a 45′ e 5-6 km.',
    difficulty: 'Intermedio', totalWeeks: 8, sessionsPerWeek: 3,
    prerequisite: 'Correre 20-25 minuti di fila (fine di “Da camminata a corsa”).',
    phases: [
      { name: 'Base continua', weeks: [1, 2], description: 'Tre corse facili, la lunga cresce piano' },
      { name: 'Ritmo', weeks: [3, 4], description: 'Variazioni di ritmo e 1% di pendenza' },
      { name: 'Scarico', weeks: [5], description: 'Meno volume, nessuna seduta dura' },
      { name: 'Lunga e veloce', weeks: [6, 7, 8], description: 'Fino a 45 minuti e 5 km' },
    ],
    tips: [
      'L’80% dei minuti resta facile: la lunga va corsa “chiacchierando”.',
      'La lunga non supera il 40% dei minuti settimanali: non allungarla per recuperare sedute perse.',
      '1% di pendenza simula il costo dell’aria aperta sopra i 9 km/h; sotto è inutile.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (e) Intervalli ad alta intensità — 6 sett ───────────── */
{
  const warm10 = [walk(5, 5.5), run(5, 7.5)];
  const fast = (n, min = 1, speed = 10, rec = 1.5) => rep(n, run(min, speed), walk(rec, 6));
  const hill = (n, incline = 6, speed = 8) => rep(n, run(1, speed, incline), walk(2, 5));
  const weeks = [
    [S('A · Intervalli brevi', '8 × (1′ veloce / 1′30″ cammino svelto)', [warm10, fast(8), cd()]),
     S('B · Salita', '6 × (1′ corsa al 6% / 2′ cammino)', [warm10, hill(6), cd()])],
    [S('A · Intervalli brevi', '10 × (1′ veloce / 1′30″ cammino svelto)', [warm10, fast(10), cd()]),
     S('B · Salita', '8 × (1′ corsa al 6% / 2′ cammino)', [warm10, hill(8), cd()])],
    [S('A · 4×4 (3 ripetute)', '3 × (4′ forte / 3′ cammino)', [warm10, rep(3, run(4, 10), walk(3, 5.5)), cd()]),
     S('B · Intervalli brevi', '8 × (1′ veloce / 1′30″ cammino svelto)', [warm10, fast(8), cd()])],
    [S('A · 4×4', '4 × (4′ forte / 3′ cammino)', [warm10, rep(4, run(4, 10), walk(3, 5.5)), cd()]),
     S('B · Salita', '8 × (1′ corsa al 6% / 2′ cammino)', [warm10, hill(8, 6, 8.5), cd()])],
    [S('A · 4×4', '4 × (4′ forte / 3′ cammino)', [warm10, rep(4, run(4, 10.5), walk(3, 5.5)), cd()]),
     S('B · Intervalli brevi', '10 × (1′ veloce / 1′30″ cammino svelto)', [warm10, fast(10, 1, 10.5), cd()])],
    [S('A · Scarico', '6 × (1′ veloce / 1′30″ cammino svelto)', [warm10, fast(6), cd()]),
     S('B · Recupero', '20′ di camminata facile', [wu(3, 4.5), walk(20, 5), cd(3, 4.5)])],
  ];
  programs.push({
    id: 'hiit_intervals', name: 'Intervalli intensi', icon: '⚡',
    description: 'Due sedute a settimana (mai consecutive) per alzare il fiato: intervalli brevi, salite e il 4×4 norvegese. Il resto della settimana resta facile.',
    difficulty: 'Avanzato', totalWeeks: 6, sessionsPerWeek: 2,
    prerequisite: 'Correre 30 minuti di fila senza fatica. Non per chi riparte da zero.',
    phases: [
      { name: 'Ingresso', weeks: [1, 2], description: 'Intervalli da 1 minuto e salite brevi' },
      { name: '4×4', weeks: [3, 4, 5], description: 'Ripetute da 4 minuti: “2-3 parole alla volta”' },
      { name: 'Scarico', weeks: [6], description: 'Una seduta ridotta e una di recupero' },
    ],
    tips: [
      'Almeno 48 ore tra due sedute intense; abbinale a 1-2 corse facili o camminate.',
      'Nel 4×4 l’ultima ripetuta deve restare “dura ma fattibile” (8/10). Se crolli, alla prossima abbassa di 0,5 km/h.',
      'Il tapis accelera lentamente: avvia il cambio di velocità qualche secondo prima del segnale.',
      'Clip di sicurezza sempre agganciata.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (f) Recupero attivo — senza progressione ───────────── */
{
  const weeks = [[
    S('A · 15 minuti', 'Camminata leggera, respiro tranquillo', [wu(3, 4), walk(10, 4.5), cd(3, 4)]),
    S('B · 18 minuti', 'Camminata leggera con 5′ al 2%', [wu(3, 4), walk(5, 4.5), walk(5, 4.5, 2), walk(2, 4.5), cd(3, 4)]),
    S('C · 20 minuti', 'Camminata leggera un po’ più lunga', [wu(3, 4), walk(14, 5), cd(3, 4)]),
  ]];
  programs.push({
    id: 'active_recovery', name: 'Recupero attivo', icon: '🌿',
    description: 'Sedute da 15-20 minuti a passo leggero per il giorno dopo un allenamento duro o quando hai poca energia. Nessuna progressione, nessuna pressione.',
    difficulty: 'Tutti', totalWeeks: 1, sessionsPerWeek: 2,
    prerequisite: 'Nessuno.',
    phases: [{ name: 'Sempre uguale', weeks: [1], description: 'Scegli la durata che ti va' }],
    tips: [
      'Sforzo 2-3 su 10: alla fine devi sentirti meglio di quando hai iniziato.',
      'Non conta come seduta di progressione e non sostituisce il riposo.',
    ],
    speedLegend: LEGEND_WALK.slice(0, 2), weeks,
  });
}

/* ───────────── (g) Camminata in salita — 8 sett ───────────── */
{
  const W = (min, incline, speed = 5) => (incline ? climb(min, incline, speed) : walk(min, speed));
  const weeks = [
    [S('A · Salita a tratti', '4 × (3′ al 3% / 2′ in piano)', [wu(5, 4.5), rep(4, W(3, 3), W(2, 0)), cd(5, 4.5)]),
     S('B · Salita dolce', '15′ al 2%', [wu(5, 4.5), W(15, 2, 4.5), cd(5, 4.5)]),
     S('C · Salita a tratti lunga', '5 × (3′ al 3% / 2′ in piano)', [wu(5, 4.5), rep(5, W(3, 3), W(2, 0)), cd(5, 4.5)])],
    [S('A · Salita a tratti', '4 × (3′ al 4% / 2′ in piano)', [wu(5, 4.5), rep(4, W(3, 4), W(2, 0)), cd(5, 4.5)]),
     S('B · Salita dolce', '18′ al 3%', [wu(5, 4.5), W(18, 3, 4.5), cd(5, 4.5)]),
     S('C · Salita a tratti lunga', '5 × (3′ al 4% / 2′ in piano)', [wu(5, 4.5), rep(5, W(3, 4), W(2, 0)), cd(5, 4.5)])],
    [S('A · Salita a tratti', '5 × (3′ al 5% / 2′ all’1%)', [wu(5, 4.5), rep(5, W(3, 5), W(2, 1)), cd(5, 4.5)]),
     S('B · Salita continua', '20′ al 3%', [wu(5, 4.5), W(20, 3), cd(5, 4.5)]),
     S('C · Salita a tratti lunga', '6 × (3′ al 5% / 2′ all’1%)', [wu(5, 4.5), rep(6, W(3, 5), W(2, 1)), cd(5, 4.5)])],
    [S('A · Salita a tratti', '5 × (3′ al 6% / 2′ all’1%)', [wu(5, 4.5), rep(5, W(3, 6), W(2, 1)), cd(5, 4.5)]),
     S('B · Salita continua', '20′ al 4%', [wu(5, 4.5), W(20, 4), cd(5, 4.5)]),
     S('C · Salita a tratti lunga', '6 × (3′ al 6% / 2′ all’1%)', [wu(5, 4.5), rep(6, W(3, 6), W(2, 1)), cd(5, 4.5)])],
    [S('A · Scarico', '15′ al 3%', [wu(5, 4.5), W(15, 3), cd(5, 4.5)]),
     S('B · Scarico', '15′ al 2%', [wu(5, 4.5), W(15, 2), cd(5, 4.5)]),
     S('C · Scarico', '18′ al 3%', [wu(5, 4.5), W(18, 3), cd(5, 4.5)])],
    [S('A · Salita continua', '25′ al 6%', [wu(5, 4.5), W(25, 6, 4.5), cd(5, 4.5)]),
     S('B · Salita a tratti', '6 × (3′ al 7% / 2′ all’1%)', [wu(5, 4.5), rep(6, W(3, 7), W(2, 1)), cd(5, 4.5)]),
     S('C · Salita continua', '25′ al 5%', [wu(5, 4.5), W(25, 5), cd(5, 4.5)])],
    [S('A · Salita continua', '28′ al 7%', [wu(5, 4.5), W(28, 7, 4.5), cd(5, 4.5)]),
     S('B · Salita a tratti', '6 × (3′ all’8% / 2′ all’1%)', [wu(5, 4.5), rep(6, W(3, 8), W(2, 1)), cd(5, 4.5)]),
     S('C · Salita continua', '28′ al 6%', [wu(5, 4.5), W(28, 6), cd(5, 4.5)])],
    [S('A · Traguardo: 30′ all’8%', '30′ al 8%, mani libere', [wu(5, 4.5), W(30, 8, 4.5), cd(5, 4.5)]),
     S('B · Salita a tratti', '6 × (3′ all’8% / 2′ all’1%)', [wu(5, 4.5), rep(6, W(3, 8), W(2, 1)), cd(5, 4.5)]),
     S('C · Salita continua', '30′ al 6%', [wu(5, 4.5), W(30, 6), cd(5, 4.5)])],
  ];
  programs.push({
    id: 'incline_walk', name: 'Camminata in salita', icon: '⛰️',
    description: 'Glutei e fiato senza impatto: la pendenza sale dell’1% a settimana fino all’8%, la velocità resta da camminata.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 3,
    prerequisite: 'Nessuno. Serve un tapis con pendenza regolabile.',
    phases: [
      { name: 'Pendenza dolce', weeks: [1, 2], description: '3-4% a tratti' },
      { name: 'Costruzione', weeks: [3, 4], description: '5-6%, tratti più lunghi' },
      { name: 'Scarico', weeks: [5], description: 'Pendenza bassa, sedute brevi' },
      { name: 'Salita continua', weeks: [6, 7, 8], description: 'Fino a 30 minuti al 6-8%' },
    ],
    tips: [
      'Spalle sopra i fianchi, mani libere: aggrapparsi al corrimano dimezza il lavoro.',
      'Aumenta la velocità solo quando tieni la pendenza senza appoggiarti.',
      'Polpacci e tendini si adattano piano: se tirano, resta una settimana in più sulla stessa pendenza.',
    ],
    speedLegend: LEGEND_WALK.slice(0, 3), weeks,
  });
}

// Normalizzazione nel formato letto dall'app: weeks[{week, sessionsPerWeek, totalDuration, sessions[], session}]
const out = programs.map(p => {
  const weeks = p.weeks.map((sessions, i) => ({
    week: i + 1,
    sessionsPerWeek: p.sessionsPerWeek,
    totalDuration: Math.round(sessions.reduce((a, s) => a + s.totalDuration, 0) / sessions.length),
    sessions,
    session: sessions[0], // retrocompatibilità
  }));
  if (weeks.length !== p.totalWeeks) throw new Error(`${p.id}: ${weeks.length} settimane ≠ totalWeeks ${p.totalWeeks}`);
  const { sessionsPerWeek, ...rest } = p;
  return { ...rest, weeks };
});

// Controlli: ogni seduta inizia e finisce camminando; salti di velocità ≤ 5 km/h; durate 15-55'
for (const p of out) for (const w of p.weeks) for (const s of w.sessions) {
  const segs = s.segments;
  if (!/Camminata/.test(segs[0].activity) || !/Camminata/.test(segs[segs.length - 1].activity)) throw new Error(`${p.id} S${w.week} ${s.name}: manca riscaldamento/defaticamento`);
  if (s.totalDuration < 15 || s.totalDuration > 55) throw new Error(`${p.id} S${w.week} ${s.name}: durata ${s.totalDuration}'`);
  for (let i = 1; i < segs.length; i++) if (Math.abs(segs[i].speed - segs[i - 1].speed) > 5) throw new Error(`${p.id} S${w.week} ${s.name}: salto di velocità`);
}
writeFileSync(join(ROOT, 'public/workout_treadmill.json'), JSON.stringify({ programs: out }, null, 2) + '\n');
for (const p of out) console.log(`${p.id.padEnd(18)} ${p.totalWeeks} sett · ${p.weeks[0].sessions.length} sedute/sett · ${p.weeks.map(w => w.totalDuration).join('/')} min`);
console.log('OK');
