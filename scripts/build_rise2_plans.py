#!/usr/bin/env python3
"""Rise 2.0 — costruisce workouts-phase1/2/3.json (84 giorni).
Settimana: D1 forza A, D2 leggero, D3 forza B, D4 leggero, D5 forza C, D6 leggero, D7 recupero.
Seduta di forza: 5 pattern (spinta, squat, tirata, core, anca) x 2 giri, 12-15 min totali.
Settimana 4 di ogni fase = scarico (-30%) + test di fase (D5)."""
import json, math
EX = json.load(open('/home/user/app-goodmorning/public/exercises.json'))

WARMCOOL = 432          # riscaldamento+defaticamento medi (s) aggiunti dall'app
PREP, MIDREST = 10, 30  # prep tra esercizi, riposo a meta'
PATTERNS = ['push', 'squat', 'pull', 'core', 'hinge']

# Varianti per fase -> blocco settimane ('early' = sett 1-2, 'late' = sett 3-4) -> seduta A/B/C.
# Ogni voce: [variante giro 1, variante giro 2] (permette destra/sinistra sui due giri).
def V(a, b=None): return [a, b or a]
LADDER = {
 1: { 'early': {
        'push':  {'A': V('push_up_wall'), 'B': V('push_up_incline'), 'C': V('push_up_wall')},
        'squat': {'A': V('wall_assisted_squat'), 'B': V('bodyweight_squat'), 'C': V('wall_assisted_squat','bodyweight_squat')},
        'pull':  {'A': V('prone_y'), 'B': V('wall_slide'), 'C': V('prone_t')},
        'core':  {'A': V('dead_bug_basic'), 'B': V('bird_dog'), 'C': V('dead_bug')},
        'hinge': {'A': V('glute_bridge'), 'B': V('hip_hinge'), 'C': V('glute_bridge_isometric')} },
      'late': {
        'push':  {'A': V('push_up_incline'), 'B': V('push_up_knees'), 'C': V('push_up_incline')},
        'squat': {'A': V('bodyweight_squat'), 'B': V('bodyweight_squat'), 'C': V('lunge_static_left','lunge_static_right')},
        'pull':  {'A': V('prone_t'), 'B': V('prone_w'), 'C': V('prone_y')},
        'core':  {'A': V('dead_bug'), 'B': V('forearm_plank'), 'C': V('bird_dog')},
        'hinge': {'A': V('glute_bridge_march'), 'B': V('hip_hinge'), 'C': V('glute_bridge')} } },
 2: { 'early': {
        'push':  {'A': V('push_up_knees'), 'B': V('push_up_knees'), 'C': V('push_up_incline')},
        'squat': {'A': V('bodyweight_squat'), 'B': V('lunge_static_left','lunge_static_right'), 'C': V('lunge_reverse')},
        'pull':  {'A': V('prone_w'), 'B': V('superman'), 'C': V('reverse_snow_angel')},
        'core':  {'A': V('plank'), 'B': V('bird_dog_knee_elbow'), 'C': V('plank_side_left','plank_side_right')},
        'hinge': {'A': V('glute_bridge_march'), 'B': V('single_leg_glute_bridge'), 'C': V('hip_hinge')} },
      'late': {
        'push':  {'A': V('push_up_knees'), 'B': V('push_up'), 'C': V('push_up_knees')},
        'squat': {'A': V('deep_squat'), 'B': V('lunge_backward_left','lunge_backward_right'), 'C': V('lunge_reverse')},
        'pull':  {'A': V('superman'), 'B': V('reverse_snow_angel'), 'C': V('prone_pull')},
        'core':  {'A': V('plank'), 'B': V('plank_side_left','plank_side_right'), 'C': V('hollow_body_hold')},
        'hinge': {'A': V('single_leg_glute_bridge'), 'B': V('glute_bridge_march'), 'C': V('reverse_plank_bridge')} } },
 3: { 'early': {
        'push':  {'A': V('push_up'), 'B': V('push_up_knees','push_up'), 'C': V('push_up')},
        'squat': {'A': V('lunge_reverse'), 'B': V('bulgarian_split_squat'), 'C': V('deep_squat')},
        'pull':  {'A': V('prone_pull'), 'B': V('superman_swimmer'), 'C': V('reverse_snow_angel')},
        'core':  {'A': V('hollow_body_hold'), 'B': V('shoulder_taps'), 'C': V('plank_side_left','plank_side_right')},
        'hinge': {'A': V('single_leg_glute_bridge'), 'B': V('single_leg_rdl'), 'C': V('glute_bridge_march')} },
      'late': {
        'push':  {'A': V('push_up'), 'B': V('close_grip_push_up'), 'C': V('push_up_archer_left','push_up_archer_right')},
        'squat': {'A': V('bulgarian_split_squat'), 'B': V('pistol_squat'), 'C': V('lunge_backward_left','lunge_backward_right')},
        'pull':  {'A': V('reverse_plank'), 'B': V('prone_pull'), 'C': V('superman_swimmer')},
        'core':  {'A': V('shoulder_taps'), 'B': V('hollow_body_hold'), 'C': V('side_plank_obliques')},
        'hinge': {'A': V('single_leg_rdl'), 'B': V('single_leg_glute_bridge'), 'C': V('reverse_plank_bridge')} } },
}
# durata lavoro (s) per fase e settimana; sett 4 = scarico
WORK = {1: [30, 30, 35, 25], 2: [30, 35, 35, 30], 3: [35, 35, 35, 30]}
# in F3 sett 3 spinta e squat salgono a 40 s
BOOST = {}  # nessun boost: le sedute restano sempre entro i 15 min

TITLES = {
 1: [("Primi passi Total Body", "Spalle aperte, core sveglio", "Gambe e glutei: le basi"),
     ("Ritmo Total Body", "Parte alta in forma", "Gambe che spingono"),
     ("Total Body piu' forte", "Spinta e tirata", "Gambe e glutei forti"),
     ("Consolida Total Body (scarico)", "Scarico attivo parte alta", "Test di fase 1")],
 2: [("Costruzione Total Body", "Parte alta: nuovo gradino", "Affondi e ponti"),
     ("Total Body in crescita", "Spinta, tirata e core", "Gambe potenti"),
     ("Total Body solido", "Primo push-up completo", "Gambe e glutei avanzati"),
     ("Consolida Total Body (scarico)", "Scarico attivo parte alta", "Test di fase 2")],
 3: [("Forza Total Body", "Spinta forte, schiena forte", "Gambe: equilibrio e forza"),
     ("Total Body atletico", "Parte alta avanzata", "Gambe monopodaliche"),
     ("Picco di forza Total Body", "Spinta massima bilanciata", "Gambe d'acciaio"),
     ("Consolida Total Body (scarico)", "Scarico attivo parte alta", "Test finale")],
}
THEME = {'A': 'totalbody', 'B': 'upper', 'C': 'legs'}

LIGHT = [  # giorni leggeri (nessun warm-up/cool-down aggiunto): mobilita' + camminata sul posto
 ("Mobilita' e camminata", [('wall_slide',45),('cat_cow_stretch',45),('hip_circles',45),('march_in_place',60),('deep_squat_position',45),('torso_rotation_standing',45),('child_pose',45),('breathing_standing',45)]),
 ("Anche e schiena sciolte", [('arm_circles',45),('lunge_thoracic_rotation_left',40),('lunge_thoracic_rotation_right',40),('march_in_place',60),('hip_mobility_9090',45),('standing_overhead_reach',45),('roll_down',45),('cobra_stretch',45)]),
 ("Scioglimento attivo", [('march_in_place',60),('wall_slide',45),('hip_circles',45),('deep_squat_position',45),('cat_cow_stretch',45),('figure_4_stretch_left',40),('figure_4_stretch_right',40),('breathing_standing',45)]),
]
RECOVERY = ("Recupero e allungamento profondo", [('child_pose',40),('cat_cow_stretch',40),('hamstring_stretch',40),('quad_stretch',40),('chest_stretch',40),('pigeon_pose_left',40),('pigeon_pose_right',40),('breathing_standing',40)])

TEST = {  # test di fase (60 s a esercizio): massimo di ripetizioni pulite / tenuta
 1: [('push_up_incline',60),('bodyweight_squat',60),('prone_t',60),('forearm_plank',60),('glute_bridge',60)],
 2: [('push_up_knees',60),('bodyweight_squat',60),('superman',60),('plank',60),('single_leg_glute_bridge',60)],
 3: [('push_up',60),('lunge_reverse',60),('prone_pull',60),('hollow_body_hold',60),('single_leg_rdl',60)],
}

def strength(phase, week, sess):
    blk = 'early' if week <= 2 else 'late'
    base = WORK[phase][week-1]
    seq = []
    for rnd in range(2):
        for p in PATTERNS:
            eid = LADDER[phase][blk][p][sess][rnd]
            dur = BOOST.get((phase, week), {}).get(p, base)
            seq.append((eid, dur))
    return seq

def est(seq, warmcool=True):
    work = sum(d for _, d in seq)
    # 'duration' nel JSON = solo blocco principale (la UI aggiunge ~6 min di
    # riscaldamento/defaticamento ai giorni che li prevedono)
    main = work + PREP*len(seq) + MIDREST
    kcal = round((work + (WARMCOOL*0.6 if warmcool else 0))/60 * 6.0 * 1.3) + 8
    return max(1, round(main/60)), kcal, work

missing = set()
for phase in (1, 2, 3):
    days = []
    for week in range(1, 5):
        for dow in range(1, 8):
            day = (week-1)*7 + dow
            if dow in (1, 3, 5):
                sess = {1: 'A', 3: 'B', 5: 'C'}[dow]
                if week == 4 and dow == 5:
                    title, theme, seq, wc = TITLES[phase][3][2], 'test', TEST[phase], True
                else:
                    title, theme, seq, wc = TITLES[phase][week-1]['ABC'.index(sess)], THEME[sess], strength(phase, week, sess), True
            elif dow == 7:
                title, theme, seq, wc = RECOVERY[0], 'recovery', RECOVERY[1], False
            else:
                li = LIGHT[{2: 0, 4: 1, 6: 2}[dow]]
                title, theme, seq, wc = li[0], 'light', li[1], False
            for eid, _ in seq:
                if eid not in EX: missing.add(eid)
            mins, kcal, work = est(seq, wc)
            days.append({"day": day, "title": title, "image": theme, "calories": kcal, "duration": mins,
                         "exercises": [{"exercise_id": e, "duration": d} for e, d in seq]})
    with open(f'/home/user/app-goodmorning/public/workouts-phase{phase}.json', 'w') as f:
        json.dump({"days": days}, f, ensure_ascii=False, indent=2); f.write('\n')
    print(f"Fase {phase}: {len(days)} giorni;", "durate forza (min):", [d['duration'] for d in days if d['image'] in ('totalbody','upper','legs','test')][:12], "...")
if missing: raise SystemExit('ID MANCANTI: ' + ', '.join(sorted(missing)))
print('OK')
