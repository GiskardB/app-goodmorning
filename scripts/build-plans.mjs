#!/usr/bin/env node
// Rise 2.0 — genera public/workouts-phase1/2/3.json (84 giorni).
// Settimana: D1 forza A · D2 leggero · D3 forza B · D4 leggero · D5 forza C (sett. 1 e 4: test) · D6 leggero · D7 recupero.
// Seduta di forza: 5 pattern (spinta, squat, tirata, core, anca) × 2 giri, sempre entro i 15 min.
// Uso: node scripts/build-plans.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EX = JSON.parse(readFileSync(join(ROOT, 'public/exercises.json'), 'utf8'));

const WARMCOOL = 432;          // riscaldamento + defaticamento medi (s), aggiunti dall'app
const PREP = 10, MIDREST = 30; // prep tra esercizi, riposo a metà
const PATTERNS = ['push', 'squat', 'pull', 'core', 'hinge'];
const V = (a, b) => [a, b || a];

// Varianti per fase → blocco ('early' = sett. 1-2, 'late' = sett. 3-4) → seduta A/B/C → [giro 1, giro 2]
const LADDER = {
  1: {
    early: {
      push:  { A: V('push_up_wall'), B: V('push_up_incline'), C: V('push_up_wall') },
      squat: { A: V('wall_assisted_squat'), B: V('bodyweight_squat'), C: V('wall_assisted_squat', 'bodyweight_squat') },
      pull:  { A: V('prone_y'), B: V('wall_slide'), C: V('prone_t') },
      core:  { A: V('dead_bug'), B: V('bird_dog'), C: V('dead_bug') },
      hinge: { A: V('glute_bridge'), B: V('hip_hinge'), C: V('glute_bridge_isometric') },
    },
    late: {
      push:  { A: V('push_up_incline'), B: V('push_up_knees'), C: V('push_up_incline') },
      squat: { A: V('bodyweight_squat'), B: V('bodyweight_squat'), C: V('lunge_static_left', 'lunge_static_right') },
      pull:  { A: V('prone_t'), B: V('prone_w'), C: V('prone_y') },
      core:  { A: V('dead_bug'), B: V('plank'), C: V('bird_dog') },
      hinge: { A: V('glute_bridge_march'), B: V('hip_hinge'), C: V('glute_bridge') },
    },
  },
  2: {
    early: {
      push:  { A: V('push_up_knees'), B: V('push_up_knees'), C: V('push_up_incline') },
      squat: { A: V('bodyweight_squat'), B: V('lunge_static_left', 'lunge_static_right'), C: V('lunge_reverse') },
      pull:  { A: V('prone_w'), B: V('superman'), C: V('reverse_snow_angel') },
      core:  { A: V('plank'), B: V('bird_dog_knee_elbow'), C: V('plank_side_left', 'plank_side_right') },
      hinge: { A: V('glute_bridge_march'), B: V('single_leg_glute_bridge'), C: V('hip_hinge') },
    },
    late: {
      push:  { A: V('push_up_knees'), B: V('push_up'), C: V('push_up_knees') },
      squat: { A: V('deep_squat'), B: V('lunge_reverse', 'lunge_reverse'), C: V('lunge_reverse') },
      pull:  { A: V('superman'), B: V('reverse_snow_angel'), C: V('prone_pull') },
      core:  { A: V('plank'), B: V('plank_side_left', 'plank_side_right'), C: V('hollow_body_hold') },
      hinge: { A: V('single_leg_glute_bridge'), B: V('glute_bridge_march'), C: V('reverse_plank_bridge') },
    },
  },
  3: {
    early: {
      push:  { A: V('push_up'), B: V('push_up_knees', 'push_up'), C: V('push_up') },
      squat: { A: V('lunge_reverse'), B: V('bulgarian_split_squat'), C: V('deep_squat') },
      pull:  { A: V('prone_pull'), B: V('superman_swimmer'), C: V('reverse_snow_angel') },
      core:  { A: V('hollow_body_hold'), B: V('shoulder_taps'), C: V('plank_side_left', 'plank_side_right') },
      hinge: { A: V('single_leg_glute_bridge'), B: V('single_leg_rdl'), C: V('glute_bridge_march') },
    },
    late: {
      push:  { A: V('push_up'), B: V('close_grip_push_up'), C: V('push_up_archer_left', 'push_up_archer_right') },
      squat: { A: V('bulgarian_split_squat'), B: V('pistol_squat'), C: V('lunge_reverse', 'lunge_reverse') },
      pull:  { A: V('reverse_plank'), B: V('prone_pull'), C: V('superman_swimmer') },
      core:  { A: V('shoulder_taps'), B: V('hollow_body_hold'), C: V('side_plank_obliques') },
      hinge: { A: V('single_leg_rdl'), B: V('single_leg_glute_bridge'), C: V('reverse_plank_bridge') },
    },
  },
};
// durata del lavoro (s) per fase e settimana; settimana 4 = scarico
const WORK = { 1: [30, 30, 35, 25], 2: [30, 35, 35, 30], 3: [35, 35, 35, 30] };

const TITLES = {
  1: [['Primi passi Total Body', 'Spalle aperte, core sveglio', 'Test iniziale'],
      ['Ritmo Total Body', 'Parte alta in forma', 'Gambe che spingono'],
      ["Total Body più forte", 'Spinta e tirata', 'Gambe e glutei forti'],
      ['Consolida Total Body (scarico)', 'Scarico attivo parte alta', 'Test di fase 1']],
  2: [['Costruzione Total Body', 'Parte alta: nuovo gradino', 'Test iniziale'],
      ['Total Body in crescita', 'Spinta, tirata e core', 'Gambe potenti'],
      ['Total Body solido', 'Primo push-up completo', 'Gambe e glutei avanzati'],
      ['Consolida Total Body (scarico)', 'Scarico attivo parte alta', 'Test di fase 2']],
  3: [['Forza Total Body', 'Spinta forte, schiena forte', 'Test iniziale'],
      ['Total Body atletico', 'Parte alta avanzata', 'Gambe monopodaliche'],
      ['Picco di forza Total Body', 'Spinta massima bilanciata', "Gambe d'acciaio"],
      ['Consolida Total Body (scarico)', 'Scarico attivo parte alta', 'Test finale']],
};
const THEME = { A: 'totalbody', B: 'upper', C: 'legs' };

// Giorni leggeri (senza warm-up/cool-down): mobilità + camminata sul posto
const LIGHT = [
  ['Mobilità e camminata', [['wall_slide', 45], ['cat_cow_stretch', 45], ['hip_circles', 45], ['march_in_place', 60], ['deep_squat_position', 45], ['torso_rotation_standing', 45], ['child_pose', 45], ['breathing_standing', 45]]],
  ['Anche e schiena sciolte', [['arm_circles', 45], ['lunge_reverse', 60], ['march_in_place', 60], ['hip_circles', 45], ['standing_overhead_reach', 45], ['hamstring_stretch', 45], ['cobra_stretch', 45]]],
  ['Scioglimento attivo', [['march_in_place', 60], ['wall_slide', 45], ['hip_circles', 45], ['deep_squat_position', 45], ['cat_cow_stretch', 45], ['figure_4_stretch_left', 40], ['figure_4_stretch_right', 40], ['breathing_standing', 45]]],
];
const RECOVERY = ['Recupero e allungamento profondo', [['child_pose', 40], ['cat_cow_stretch', 40], ['hamstring_stretch', 40], ['quad_stretch', 40], ['chest_stretch', 40], ['figure_4_stretch_left', 40], ['figure_4_stretch_right', 40], ['breathing_standing', 40]]];

// Test di fase (60 s a prova): massimo di ripetizioni pulite / tenuta. Identico in settimana 1 e 4.
const TEST = {
  1: [['push_up_incline', 60], ['bodyweight_squat', 60], ['prone_t', 60], ['plank', 60], ['glute_bridge', 60]],
  2: [['push_up_knees', 60], ['bodyweight_squat', 60], ['superman', 60], ['plank', 60], ['single_leg_glute_bridge', 60]],
  3: [['push_up', 60], ['lunge_reverse', 60], ['prone_pull', 60], ['hollow_body_hold', 60], ['single_leg_rdl', 60]],
};

function strength(phase, week, sess) {
  const blk = week <= 2 ? 'early' : 'late';
  const dur = WORK[phase][week - 1];
  const seq = [];
  for (let rnd = 0; rnd < 2; rnd++) for (const p of PATTERNS) seq.push([LADDER[phase][blk][p][sess][rnd], dur]);
  return seq;
}

// 'duration' nel JSON = solo blocco principale (la UI aggiunge ~6 min di warm-up/cool-down dove previsti)
function est(seq, warmcool) {
  const work = seq.reduce((s, [, d]) => s + d, 0);
  const main = work + PREP * seq.length + MIDREST;
  const kcal = Math.round((work + (warmcool ? WARMCOOL * 0.6 : 0)) / 60 * 6.0 * 1.3) + 8;
  return [Math.max(1, Math.round(main / 60)), kcal];
}

const missing = new Set();
for (const phase of [1, 2, 3]) {
  const days = [];
  for (let week = 1; week <= 4; week++) {
    for (let dow = 1; dow <= 7; dow++) {
      const day = (week - 1) * 7 + dow;
      let title, theme, seq, wc;
      if (dow === 1 || dow === 3 || dow === 5) {
        const sess = { 1: 'A', 3: 'B', 5: 'C' }[dow];
        if (dow === 5 && (week === 1 || week === 4)) {
          [title, theme, seq, wc] = [TITLES[phase][week - 1][2], 'test', TEST[phase], true];
        } else {
          [title, theme, seq, wc] = [TITLES[phase][week - 1]['ABC'.indexOf(sess)], THEME[sess], strength(phase, week, sess), true];
        }
      } else if (dow === 7) {
        [title, theme, seq, wc] = [RECOVERY[0], 'recovery', RECOVERY[1], false];
      } else {
        const li = LIGHT[{ 2: 0, 4: 1, 6: 2 }[dow]];
        [title, theme, seq, wc] = [li[0], 'light', li[1], false];
      }
      for (const [eid] of seq) if (!EX[eid]) missing.add(eid);
      const [duration, calories] = est(seq, wc);
      days.push({ day, title, image: theme, calories, duration, exercises: seq.map(([exercise_id, d]) => ({ exercise_id, duration: d })) });
    }
  }
  writeFileSync(join(ROOT, `public/workouts-phase${phase}.json`), JSON.stringify({ days }, null, 2) + '\n');
  console.log(`Fase ${phase}: ${days.length} giorni`);
}
if (missing.size) { console.error('ID MANCANTI: ' + [...missing].sort().join(', ')); process.exit(1); }
console.log('OK');
