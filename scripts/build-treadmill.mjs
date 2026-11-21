#!/usr/bin/env node
// Programmi tapis roulant — genera public/workout_treadmill.json.
// Basato su: NHS Couch-to-5K, Galloway run/walk, Jones & Doust 1996 (pendenza 1%),
// Compendium of Physical Activities, Ekkekakis (piacere sotto soglia ventilatoria),
// Helgerud 2007 (4×4), Gibala (10×1′), Seiler (80/20), ACSM 2009 (150-250 min/sett per il peso),
// OMS 2020 (150-300 min/sett). Metodo e revisione: docs/PIANO_TREADMILL.md
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
  { level: 'Camminata svelta +', speed: 6.5, feeling: 'Solo a tratti brevi: respiro profondo, frasi corte' },
];
const LEGEND_RUN = [
  { level: 'Camminata', speed: 5, feeling: 'Tranquillo, parli con facilità' },
  { level: 'Camminata svelta', speed: 6, feeling: 'Un po’ impegnato, parli a frasi intere' },
  { level: 'Corsa leggera', speed: 7.5, feeling: 'Corsa “chiacchierabile”: frasi intere' },
  { level: 'Corsa', speed: 8.5, feeling: 'Respiro ritmico, frasi brevi' },
  { level: 'Corsa veloce', speed: 10, feeling: 'Solo 2-3 parole alla volta' },
];

const programs = [];

/* ───────────── (a) Da camminata a corsa — 10 livelli ─────────────
   Minuti di corsa per seduta: mai oltre +30 % da un livello al successivo;
   tratto continuo più lungo: mai oltre +5′ (il salto 8′→20′ del C25K è smussato). */
{
  const r = (min) => run(min, 7.5);
  const w = (min) => walk(min, 5.5);
  const weeks = [
    [ // 1 · ingresso: solo cammino, finire con "potevo fare di più"
      S('A · Tratti svelti', '6 tratti di camminata svelta', [wu(5, 4.5), rep(6, walk(1, 6), walk(2, 5)), cd(4)]),
      S('B · Cammino continuo', '20 minuti di camminata tranquilla', [wu(4, 4.5), walk(20, 5), cd(4)]),
      S('C · Tratti svelti +', '8 tratti svelti, recuperi più brevi', [wu(5, 4.5), rep(8, walk(1, 6), walk(1.5, 5)), cd(4)]),
    ],
    [ // 2 · prime corse: 1' corsa / 1'30'' cammino (7 min di corsa)
      S('A · Corsa e cammino', '7 × (1′ corsa / 1′30″ cammino)', [wu(), rep(7, r(1), w(1.5)), cd()]),
      S('B · Versione corta', '6 × (1′ corsa / 1′30″ cammino)', [wu(), rep(6, r(1), w(1.5)), cd()]),
      S('C · Versione lunga', '8 × (1′ corsa / 1′30″ cammino)', [wu(), rep(8, r(1), w(1.5)), cd()]),
    ],
    [ // 3 · 8-9 min di corsa
      S('A · Corsa e cammino', '6 × (1′30″ corsa / 2′ cammino)', [wu(), rep(6, r(1.5), w(2)), cd()]),
      S('B · Versione corta', '5 × (1′30″ corsa / 2′ cammino)', [wu(), rep(5, r(1.5), w(2)), cd()]),
      S('C · Versione lunga', '6 × (1′30″ corsa / 1′30″ cammino)', [wu(), rep(6, r(1.5), w(1.5)), cd()]),
    ],
    [ // 4 · 10-11 min di corsa, primi 3-4' continui
      S('A · Blocchi da 2 e 3', '2′, 3′, 2′, 3′ di corsa', [wu(), r(2), w(2), r(3), w(2), r(2), w(2), r(3), cd()]),
      S('B · Versione regolare', '5 × (2′ corsa / 2′ cammino)', [wu(), rep(5, r(2), w(2)), cd()]),
      S('C · Primi 4 minuti', '1′30″, 3′, 3′, 4′ di corsa', [wu(), r(1.5), w(1.5), r(3), w(2.5), r(3), w(2.5), r(4), cd()]),
    ],
    [ // 5 · 12-15 min di corsa, primi 5' continui
      S('A · Blocchi da 3-4 minuti', '3′, 3′, 4′, 3′ di corsa', [wu(), r(3), w(1.5), r(3), w(1.5), r(4), w(2), r(3), cd()]),
      S('B · Versione corta', '4 × (3′ corsa / 2′ cammino)', [wu(), rep(4, r(3), w(2)), cd()]),
      S('C · Primi 5 minuti', '3′, 5′, 3′, 4′ di corsa', [wu(), r(3), w(1.5), r(5), w(2.5), r(3), w(1.5), r(4), cd()]),
    ],
    [ // 6 · 15-16 min di corsa, primi 10' continui
      S('A · Tre da 5', '3 × (5′ corsa / 3′ cammino)', [wu(), rep(3, r(5), w(3)), cd()]),
      S('B · Due da 8', '2 × (8′ corsa / 5′ cammino)', [wu(), rep(2, r(8), w(5)), cd()]),
      S('C · Primi 10 minuti', '10′ corsa, 3′ cammino, 6′ corsa', [wu(), r(10), w(3), r(6), cd()]),
    ],
    [ // 7 · 18-20 min di corsa, primi 15' continui
      S('A · Piramide', '5′, 8′, 5′ di corsa', [wu(), r(5), w(3), r(8), w(3), r(5), cd()]),
      S('B · Due da 10', '2 × (10′ corsa / 3′ cammino)', [wu(), rep(2, r(10), w(3)), cd()]),
      S('C · Primi 15 minuti', '15′ corsa, 3′ cammino, 5′ corsa', [wu(), r(15), w(3), r(5), cd()]),
    ],
    [ // 8 · consolidamento + traguardo 20'
      S('A · Scarico', '2 × (8′ corsa / 3′ cammino)', [wu(), rep(2, r(8), w(3)), cd()]),
      S('B · 12 + 8', '12′ corsa, 3′ cammino, 8′ corsa', [wu(), r(12), w(3), r(8), cd()]),
      S('C · Traguardo: 20 minuti', '20′ di corsa continua', [wu(), r(20), cd()]),
    ],
    [ // 9
      S('A · 22 continui', '22′ di corsa continua', [wu(), r(22), cd()]),
      S('B · Due da 12', '2 × (12′ corsa / 2′ cammino)', [wu(), rep(2, r(12), w(2)), cd()]),
      S('C · 25 continui', '25′ di corsa continua', [wu(), r(25), cd()]),
    ],
    [ // 10
      S('A · 25 continui', '25′ di corsa continua', [wu(), r(25), cd()]),
      S('B · Due da 14', '2 × (14′ corsa / 2′ cammino)', [wu(), rep(2, r(14), w(2)), cd()]),
      S('C · Traguardo: 30 minuti', '30′ di corsa continua ≈ 4-5 km', [wu(), r(30), cd()]),
    ],
  ];
  programs.push({
    id: 'soft_couch_to_run', name: 'Da camminata a corsa', icon: '🚶‍♂️',
    description: 'Dal divano a 30 minuti di corsa continua in 10 livelli progressivi, con pause di cammino programmate.',
    difficulty: 'Principiante', totalWeeks: 10, sessionsPerWeek: 3,
    prerequisite: 'Nessuno.',
    phases: [
      { name: 'Ingresso', weeks: [1], description: 'Solo cammino: prendi confidenza col tapis' },
      { name: 'Prime corse', weeks: [2, 3, 4, 5], description: 'Tratti di corsa brevi, cammino tra uno e l’altro' },
      { name: 'Corse più lunghe', weeks: [6, 7, 8], description: 'Blocchi da 5 a 20 minuti, rampa dolce' },
      { name: 'Corsa continua', weeks: [9, 10], description: 'Fino a 30 minuti senza fermarti' },
    ],
    tips: [
      'Le pause di cammino sono parte del piano, non un fallimento.',
      'Velocità giusta = riesci a parlare a frasi intere. Se ansimi, rallenta.',
      'Ripetere un livello è previsto: passa al successivo solo quando le sedute ti sono sembrate gestibili.',
      'Tre sedute a settimana, mai in giorni consecutivi.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (b) Camminata attiva — 8 livelli ─────────────
   Camminata continua mai oltre 6 km/h (sopra, il passo diventa innaturale e costa più della corsa):
   l'intensità sale con la pendenza; 6,5 km/h solo a tratti di 2-3 minuti. */
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
    [S('A · Traguardo: 30 svelti', '30′ di camminata svelta', [wu(5, 4.5), walk(30, 6), cd(5, 4.5)]),
     S('B · Salita a tratti', '4 × (3′ al 4% / 3′ in piano)', [wu(5, 4.5), rep(4, walk(3, 6, 4), walk(3, 5.5)), cd(5, 4.5)]),
     S('C · Svelta in salita', '25′ svelta al 3%', [wu(5, 4.5), walk(25, 6, 3), cd(5, 4.5)])],
    [S('A · Svelta in leggera salita', '30′ svelta al 2%', [wu(5, 4.5), walk(30, 6, 2), cd(5, 4.5)]),
     S('B · Salita a tratti', '5 × (3′ al 5% / 3′ in piano)', [wu(5, 4.5), rep(5, walk(3, 6, 5), walk(3, 5.5)), cd(5, 4.5)]),
     S('C · Svelta in salita', '30′ svelta al 3%', [wu(5, 4.5), walk(30, 6, 3), cd(5, 4.5)])],
  ];
  programs.push({
    id: 'active_walk', name: 'Camminata attiva', icon: '🥾',
    description: 'Da 20 a 40 minuti di camminata svelta in 8 livelli, senza mai correre. Ideale per ricominciare a muoversi.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 3,
    prerequisite: 'Nessuno.',
    phases: [
      { name: 'Base', weeks: [1, 2], description: 'Abitudine prima dell’intensità' },
      { name: 'Ritmo', weeks: [3, 4], description: 'Tratti svelti, poi un livello di scarico' },
      { name: 'Svelta', weeks: [5, 6], description: 'Camminata svelta continua e prime salite' },
      { name: 'Svelta e salita', weeks: [7, 8], description: '30 minuti svelti: lo sforzo cresce con la pendenza, non con la velocità' },
    ],
    tips: [
      'Cadenza da camminata svelta: circa 100 passi al minuto, braccia che oscillano.',
      'In salita mani libere: aggrapparsi al corrimano annulla il lavoro.',
      'Se una seduta è sembrata dura, ripeti il livello: la progressione non scappa.',
      'Tre sedute coprono 100-120 minuti: una passeggiata libera nel weekend ti porta ai 150 consigliati dall’OMS.',
    ],
    speedLegend: LEGEND_WALK, weeks,
  });
}

/* ───────────── (c) Dimagrimento — 8 livelli, 4 sedute ─────────────
   ACSM 2009: 150-250 min/sett moderati. Sedute mai oltre 45′: dal livello 5 cresce l'intensità
   (pendenza, intervalli), non la durata. Intervalli a basso impatto nei primi due livelli. */
{
  const z2 = (min, incline = 0) => walk(min, 6, incline);
  const WINT = (n) => rep(n, walk(1, 6.5), walk(2, 5.5));                        // intervalli di passo
  const INT = (n, on = 1, off = 2, speed = 7.5) => rep(n, run(on, speed), walk(off, 5.5)); // intervalli di corsa leggera
  const weeks = [
    [S('A · Zona 2', '20′ a ritmo “chiacchierabile”', [wu(), z2(20), cd()]),
     S('B · Intervalli di passo', '6 × (1′ svelta+ / 2′ normale)', [wu(), WINT(6), cd()]),
     S('C · Zona 2 lunga', '25′ a ritmo “chiacchierabile”', [wu(), z2(25), cd()]),
     S('D · Salita dolce', '15′ al 4% a passo normale', [wu(), climb(15, 4), cd()])],
    [S('A · Zona 2', '25′ a ritmo “chiacchierabile”', [wu(), z2(25), cd()]),
     S('B · Intervalli di passo', '8 × (1′ svelta+ / 2′ normale)', [wu(), WINT(8), cd()]),
     S('C · Zona 2 lunga', '30′ a ritmo “chiacchierabile”', [wu(), z2(30), cd()]),
     S('D · Salita dolce', '20′ al 4%', [wu(), climb(20, 4), cd()])],
    [S('A · Zona 2', '30′ a ritmo “chiacchierabile”', [wu(), z2(30), cd()]),
     S('B · Intervalli dolci', '8 × (1′ corsa leggera / 2′ cammino)', [wu(), INT(8), cd()]),
     S('C · Zona 2 lunga', '35′ a ritmo “chiacchierabile”', [wu(), z2(35), cd()]),
     S('D · Salita', '25′ al 5%', [wu(), climb(25, 5), cd()])],
    [S('A · Scarico', '20′ zona 2', [wu(), z2(20), cd()]),
     S('B · Scarico', '25′ zona 2, niente intervalli', [wu(), z2(25), cd()]),
     S('C · Scarico', '25′ zona 2', [wu(), z2(25), cd()]),
     S('D · Scarico in salita', '20′ al 3%', [wu(), climb(20, 3), cd()])],
    [S('A · Zona 2 in leggera salita', '30′ svelta al 2%', [wu(), z2(30, 2), cd()]),
     S('B · Intervalli dolci', '10 × (1′ corsa leggera / 2′ cammino)', [wu(), INT(10), cd()]),
     S('C · Zona 2 lunga', '35′ svelta all’1%', [wu(), z2(35, 1), cd()]),
     S('D · Salita', '30′ al 5%', [wu(), climb(30, 5), cd()])],
    [S('A · Zona 2 in leggera salita', '32′ svelta al 2%', [wu(), z2(32, 2), cd()]),
     S('B · Intervalli', '10 × (1′30″ corsa leggera / 1′30″ cammino)', [wu(), INT(10, 1.5, 1.5), cd()]),
     S('C · Zona 2 lunga', '35′ svelta al 2%', [wu(), z2(35, 2), cd()]),
     S('D · Salita', '30′ al 6%', [wu(), climb(30, 6), cd()])],
    [S('A · Zona 2 in leggera salita', '35′ svelta al 2%', [wu(), z2(35, 2), cd()]),
     S('B · Intervalli', '8 × (2′ corsa / 2′ cammino)', [wu(), INT(8, 2, 2, 8), cd()]),
     S('C · Zona 2 lunga', '35′ svelta al 3%', [wu(), z2(35, 3), cd()]),
     S('D · Salita', '35′ al 6%', [wu(), climb(35, 6), cd()])],
    [S('A · Scarico', '25′ zona 2', [wu(), z2(25), cd()]),
     S('B · Scarico', '25′ svelta all’1%, niente intervalli', [wu(), z2(25, 1), cd()]),
     S('C · Scarico', '30′ zona 2', [wu(), z2(30), cd()]),
     S('D · Scarico in salita', '20′ al 4%', [wu(), climb(20, 4), cd()])],
  ];
  programs.push({
    id: 'fat_loss', name: 'Dimagrimento', icon: '🔥',
    description: 'Da 120 a 180 minuti a settimana senza mai superare i 45 minuti a seduta: cresce l’intensità, non la fatica. 3 sedute in zona 2 + 1 variata.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 4,
    prerequisite: 'Nessuno.',
    phases: [
      { name: 'Avvio', weeks: [1, 2], description: '120-140 minuti a settimana, tutto a basso impatto' },
      { name: 'Costruzione', weeks: [3, 4], description: '150 minuti e primi tratti di corsa leggera, poi un livello di scarico' },
      { name: 'Intensità', weeks: [5, 6, 7], description: '165-180 minuti: stessa durata, più pendenza e intervalli' },
      { name: 'Consolidamento', weeks: [8], description: 'Scarico: mantieni l’abitudine' },
    ],
    tips: [
      'La “zona brucia-grassi” non esiste: contano le calorie totali della settimana, e le fai solo se continui.',
      'Zona 2 = parli a frasi intere. Se non riesci, rallenta: non è un cedimento, è il metodo.',
      'Obiettivo settimanale, non giornaliero: se salti una seduta, fanne una da 15′ entro due giorni. Mai saltarne due di fila.',
      'Se correre non fa per te, nei tratti di corsa cammina svelto: il lavoro resta valido.',
      'Intervalli e salita: al massimo una seduta impegnativa a settimana.',
      'Se corri già con facilità, puoi fare la zona 2 di corsa leggera a 7-8 km/h.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (d) Resistenza: 5 km continui — 8 livelli ─────────────
   80/20 (Seiler): i minuti a 9,5 km/h o più restano sotto il 20 % della corsa del livello.
   Ripetute da 3′ dal livello 6 (più tempo vicino al VO2max delle variazioni da 2′). */
{
  const weeks = [
    [S('A · Corsa facile', '22′ di corsa', [wu(), run(22, 8), cd()]),
     S('B · Corsa facile', '25′ di corsa', [wu(), run(25, 8), cd()]),
     S('C · Lunga', '30′ di corsa leggera', [wu(), run(30, 7.5), cd()])],
    [S('A · Corsa facile', '25′ di corsa', [wu(), run(25, 8), cd()]),
     S('B · Corsa facile', '28′ di corsa', [wu(), run(28, 8), cd()]),
     S('C · Lunga', '32′ di corsa leggera', [wu(), run(32, 7.5), cd()])],
    [S('A · Variazioni di ritmo', '6 × (2′ corsa / 2′ leggera)', [wu(), rep(6, run(2, 9), run(2, 7.5)), cd()]),
     S('B · Corsa all’1%', '28′ di corsa con 1% di pendenza', [wu(), run(28, 8, 1), cd()]),
     S('C · Lunga', '34′ di corsa leggera', [wu(), run(34, 7.5), cd()])],
    [S('A · Variazioni di ritmo', '7 × (2′ corsa / 2′ leggera)', [wu(), rep(7, run(2, 9), run(2, 7.5)), cd()]),
     S('B · Corsa all’1%', '30′ di corsa con 1% di pendenza', [wu(), run(30, 8, 1), cd()]),
     S('C · Lunga', '36′ di corsa leggera', [wu(), run(36, 7.5), cd()])],
    [S('A · Scarico', '20′ di corsa', [wu(), run(20, 8), cd()]),
     S('B · Scarico', '22′ di corsa leggera', [wu(), run(22, 7.5), cd()]),
     S('C · Scarico', '25′ di corsa', [wu(), run(25, 8), cd()])],
    [S('A · Ripetute da 3′', '5 × (3′ veloce / 2′ leggera)', [wu(), rep(5, run(3, 9.5), run(2, 7.5)), cd()]),
     S('B · Finale in crescendo', '25′ di corsa + 5′ più veloci', [wu(), run(25, 8), run(5, 9), cd()]),
     S('C · Lunga', '36′ di corsa', [wu(), run(36, 8), cd()])],
    [S('A · Ripetute da 3′', '6 × (3′ veloce / 2′ leggera)', [wu(), rep(6, run(3, 9.5), run(2, 7.5)), cd()]),
     S('B · Finale in crescendo', '25′ di corsa + 5′ più veloci', [wu(), run(25, 8), run(5, 9), cd()]),
     S('C · Lunga', '38′ di corsa', [wu(), run(38, 8), cd()])],
    [S('A · Ripetute da 3′', '5 × (3′ veloce / 2′30″ leggera)', [wu(), rep(5, run(3, 10), run(2.5, 7.5)), cd()]),
     S('B · Corsa', '30′ di corsa', [wu(), run(30, 8.5), cd()]),
     S('C · Traguardo: 5 km', '40′ di corsa ≈ 5,3 km', [wu(), run(40, 8), cd()])],
  ];
  programs.push({
    id: 'endurance_5k', name: 'Resistenza: 5 km', icon: '🏃',
    description: 'Per chi corre già 20-30 minuti: una lunga che cresce di 2′ a ogni livello, una seduta di ritmo e una facile. Arrivi a 40′ e 5 km abbondanti.',
    difficulty: 'Intermedio', totalWeeks: 8, sessionsPerWeek: 3,
    prerequisite: 'Correre 20-25 minuti di fila (fine di “Da camminata a corsa”).',
    phases: [
      { name: 'Base continua', weeks: [1, 2], description: 'Tre corse facili, la lunga cresce piano' },
      { name: 'Ritmo', weeks: [3, 4], description: 'Variazioni di ritmo e 1% di pendenza' },
      { name: 'Scarico', weeks: [5], description: 'Meno volume, nessuna seduta dura' },
      { name: 'Lunga e veloce', weeks: [6, 7, 8], description: 'Ripetute da 3 minuti e lunga fino a 40 minuti: 5 km' },
    ],
    tips: [
      'L’80% dei minuti resta facile: la lunga va corsa “chiacchierando”.',
      'Le ripetute vanno corse “dure ma controllate”: l’ultima deve somigliare alla prima.',
      'La lunga non supera il 40% dei minuti settimanali: non allungarla per recuperare sedute perse.',
      '1% di pendenza simula il costo dell’aria aperta sopra i 9 km/h; sotto è inutile.',
    ],
    speedLegend: LEGEND_RUN, weeks,
  });
}

/* ───────────── (e) Intervalli ad alta intensità — 6 livelli ───────────── */
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
     S('B · Intervalli 10 × 1', '10 × (1′ veloce / 1′ cammino svelto)', [warm10, fast(10, 1, 10.5, 1), cd()])],
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

/* ───────────── (g) Camminata in salita — 8 livelli ───────────── */
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
    description: 'Glutei e fiato senza impatto: la pendenza sale dell’1% a ogni livello fino all’8%, la velocità resta da camminata.',
    difficulty: 'Principiante', totalWeeks: 8, sessionsPerWeek: 3, requiresIncline: true,
    prerequisite: 'Tapis con pendenza regolabile.',
    phases: [
      { name: 'Pendenza dolce', weeks: [1, 2], description: '3-4% a tratti' },
      { name: 'Costruzione', weeks: [3, 4], description: '5-6%, tratti più lunghi' },
      { name: 'Scarico', weeks: [5], description: 'Pendenza bassa, sedute brevi' },
      { name: 'Salita continua', weeks: [6, 7, 8], description: 'Fino a 30 minuti al 6-8%' },
    ],
    tips: [
      'Spalle sopra i fianchi, mani libere: aggrapparsi al corrimano dimezza il lavoro.',
      'Aumenta la velocità solo quando tieni la pendenza senza appoggiarti.',
      'Polpacci e tendini si adattano piano: se tirano, resta ancora qualche seduta sullo stesso livello.',
    ],
    speedLegend: LEGEND_WALK.slice(0, 3), weeks,
  });
}

// "Perché" di ogni seduta: dare la ragione di un compito sostiene la motivazione autonoma (Deci 1994, SDT).
function whyFor(pid, s) {
  const n = s.name;
  if (pid === 'active_recovery' || /Recupero/.test(n)) return 'Muoversi piano scioglie le gambe e tiene viva l’abitudine, senza aggiungere fatica.';
  if (/Scarico/.test(n)) return 'Scarico: è riposando che il corpo assimila il lavoro dei livelli precedenti.';
  if (/Traguardo/.test(n)) return 'Un traguardo misurabile: la prova concreta di quanto sei cresciuto.';
  if (/4×4/.test(n)) return 'Le ripetute da quattro minuti sono tra gli stimoli più efficaci per alzare il massimo consumo di ossigeno.';
  if (/Interval|Ripetute|Variazioni|Piramide|crescendo|Tratti svelti/.test(n)) return 'I cambi di ritmo allenano cuore e fiato in meno tempo e spezzano la monotonia.';
  if (/1%/.test(n)) return 'L\u20191% di pendenza riproduce il costo della corsa all\u2019aperto: stessa velocità, lavoro più realistico.';
  if (/[Ss]alita/.test(n)) return 'La pendenza alza lo sforzo senza impatto sulle articolazioni e fa lavorare glutei e polpacci.';
  if (/Zona 2/.test(n)) return 'Ritmo “chiacchierabile”: è l’intensità che riesci a ripetere ogni settimana, ed è la costanza a fare la differenza.';
  if (/Lunga/.test(n)) return 'La seduta più lunga costruisce la resistenza: va fatta piano, parlando.';
  if (/[Cc]orta/.test(n)) return 'Versione breve per i giorni pieni: mantiene il filo senza pesare.';
  if (pid === 'soft_couch_to_run') {
    if (s.segments.some(x => /Corsa/.test(x.activity)) && !s.segments.some((x, i) => i > 0 && i < s.segments.length - 1 && /Camminata/.test(x.activity))) return 'Correre senza pause a ritmo facile: è la base su cui si costruisce tutto il resto.';
    if (!s.segments.some(x => /Corsa/.test(x.activity))) return 'Prima di correre si prende confidenza col tapis: finisci con la voglia di rifarlo.';
    return 'Alternare corsa e cammino abitua tendini e fiato senza strafare: ogni tratto finito è un successo.';
  }
  if (pid === 'endurance_5k') return 'Corsa facile: gran parte dei progressi di resistenza nasce da qui.';
  return 'Camminare a passo deciso è già allenamento: conta la regolarità, non la fatica.';
}

// Nell'app ogni `week` è presentato come "Livello" (l'utente sceglie per tempo e intensità, non per calendario).
// Normalizzazione nel formato letto dall'app: weeks[{week, sessionsPerWeek, totalDuration, sessions[], session}]
const out = programs.map(p => {
  const weeks = p.weeks.map((sessions, i) => {
    const full = sessions.map(s => ({ ...s, why: whyFor(p.id, s) }));
    return {
      week: i + 1,
      sessionsPerWeek: p.sessionsPerWeek,
      totalDuration: Math.round(full.reduce((a, s) => a + s.totalDuration, 0) / full.length),
      sessions: full,
      session: full[0], // retrocompatibilità
    };
  });
  if (weeks.length !== p.totalWeeks) throw new Error(`${p.id}: ${weeks.length} livelli ≠ totalWeeks ${p.totalWeeks}`);
  const { sessionsPerWeek, ...rest } = p;
  return { ...rest, weeks };
});

/* ───────────── Controlli automatici delle regole ───────────── */
const isRun = (x) => /Corsa/.test(x.activity);
const isWalk = (x) => /Camminata|Salita/.test(x.activity);
const runMin = (s) => s.segments.filter(isRun).reduce((a, x) => a + x.duration, 0) / 60;
const longestRun = (s) => Math.max(0, ...s.segments.filter(isRun).map(x => x.duration / 60));
const fail = (msg) => { throw new Error(msg); };
for (const p of out) for (const w of p.weeks) for (const s of w.sessions) {
  const segs = s.segments, id = `${p.id} L${w.week} ${s.name}`;
  // 1) si inizia e si finisce camminando: almeno 3′ (5′ se la seduta contiene corsa)
  const need = segs.some(isRun) ? 5 : 3;
  if (!/Camminata/.test(segs[0].activity) || segs[0].duration < need * 60) fail(`${id}: riscaldamento < ${need}′`);
  if (!/Camminata/.test(segs[segs.length - 1].activity) || segs[segs.length - 1].duration < 3 * 60) fail(`${id}: defaticamento < 3′`);
  // 2) durata 15-50′ (dimagrimento e camminata: massimo 45′)
  const cap = ['fat_loss', 'active_walk', 'incline_walk'].includes(p.id) ? 45 : 50;
  if (s.totalDuration < 15 || s.totalDuration > cap) fail(`${id}: durata ${s.totalDuration}′ fuori da 15-${cap}`);
  // 3) camminata oltre 6 km/h solo a tratti di 3′ al massimo
  for (const x of segs) if (isWalk(x) && x.speed > 6 && x.duration > 180) fail(`${id}: camminata a ${x.speed} km/h per ${x.duration / 60}′`);
  // 4) cambi di velocità mai oltre 5 km/h
  for (let i = 1; i < segs.length; i++) if (Math.abs(segs[i].speed - segs[i - 1].speed) > 5) fail(`${id}: salto di velocità`);
}
{ // 5) da camminata a corsa: minuti di corsa ≤ +30 % e tratto continuo ≤ +5′ da un livello all'altro
  const p = out.find(x => x.id === 'soft_couch_to_run');
  const avg = p.weeks.map(w => w.sessions.reduce((a, s) => a + runMin(s), 0) / w.sessions.length);
  const lng = p.weeks.map(w => Math.max(...w.sessions.map(longestRun)));
  for (let i = 2; i < avg.length; i++) {
    const prev = Math.max(...avg.slice(1, i)); // rispetto al massimo già raggiunto (dopo uno scarico non conta il calo)
    if (avg[i] > prev * 1.3 + 0.01) fail(`soft_couch_to_run L${i + 1}: corsa ${avg[i].toFixed(1)}′ > +30 % di ${prev.toFixed(1)}′`);
    if (lng[i] - Math.max(...lng.slice(0, i)) > 5.01) fail(`soft_couch_to_run L${i + 1}: tratto continuo +${(lng[i] - lng[i - 1]).toFixed(1)}′`);
  }
  console.log('corsa/seduta per livello:', avg.map(a => a.toFixed(1)).join(' → '), '| continuo max:', lng.join(' → '));
}
{ // 6) resistenza: minuti veloci (≥ 9,5 km/h) sotto il 20 % della corsa del livello
  const p = out.find(x => x.id === 'endurance_5k');
  for (const w of p.weeks) {
    const tot = w.sessions.reduce((a, s) => a + runMin(s), 0);
    const hard = w.sessions.reduce((a, s) => a + s.segments.filter(x => isRun(x) && x.speed >= 9.5).reduce((b, x) => b + x.duration, 0) / 60, 0);
    if (hard / tot > 0.2) fail(`endurance_5k L${w.week}: ${Math.round(100 * hard / tot)} % di minuti veloci`);
  }
}
writeFileSync(join(ROOT, 'public/workout_treadmill.json'), JSON.stringify({ programs: out }, null, 2) + '\n');
for (const p of out) console.log(`${p.id.padEnd(18)} ${p.totalWeeks} livelli · ${p.weeks[0].sessions.length} sedute · ${p.weeks.map(w => w.sessions.map(s => s.totalDuration).join('/')).join('  ')}`);
console.log('OK');
