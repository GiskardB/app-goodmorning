# Programmi tapis roulant — metodo e piani

_Aggiornato: 2026-10-22. Generatore: `scripts/build-treadmill.mjs` → `public/workout_treadmill.json`._

## Diagnosi del programma precedente
- Un solo programma reale (12 settimane) più un programma di prova ("Prova") rimasto nei dati.
- Quattro settimane di sola camminata prima del primo passo di corsa: troppo lento per chi vuole
  correre, nessuna alternativa per chi vuole solo camminare, dimagrire o fare salita.
- Una sola seduta per settimana, ripetuta tre volte: monotonia, nessuna "lunga" né "corta".
- Nessuna indicazione sulla sensazione (talk test), nessun consiglio per non mollare, niente pendenza.

## Cosa dice la letteratura (sintesi)
- **Couch-to-5K (NHS)**: 9 settimane, 3 sedute, un giorno di riposo tra l'una e l'altra; ogni seduta
  apre e chiude con cammino. Il salto brusco della settimana 5 (8′ → 20′ continui) è il punto di
  abbandono più noto: qui è smussato (8′ → 10′ → 15′ → 20′).
- **Run/walk (Galloway)**: pause di cammino programmate a priori, non quando si è stanchi; così "ogni
  corsa sembra un successo". Rapporto d'ingresso 1′ corsa / 1′30″ cammino.
- **Progressione**: nessuna soglia magica (Buist 2008, Nielsen 2014), ma evitare picchi >30 %/sett e
  non allungare il tratto continuo di più di ~5′ da una settimana all'altra.
- **Piacere e aderenza (Ekkekakis, dual-mode theory)**: sopra la soglia ventilatoria il piacere cala
  quasi per tutti; sotto resta positivo. Intensità auto-regolata > imposta anche a pari carico.
  Regola: le prime settimane finiscono con "potevo fare di più".
- **Talk test**: parlare a frasi intere = sotto soglia. Ogni legenda velocità riporta la sensazione.
- **80/20 polarizzato** (Muñoz/Seiler): ≥80 % dei minuti facili, al massimo 1 seduta intensa a settimana.
- **Dose minima (Lee 2014)**: 5-10 min/die di corsa lenta già riducono la mortalità; OMS 2020:
  150-300 min/sett moderati.
- **Dimagrimento**: HIIT e continuo danno perdita di grasso equivalente a pari calorie (Keating 2017);
  la "zona brucia-grassi" è fuorviante. Conta la spesa settimanale, quindi l'aderenza.
- **Tapis**: 1 % di pendenza simula l'aria aperta solo sopra ~9 km/h (Jones & Doust 1996); in salita
  il gluteo lavora ~25 % in più; corrimano vietato nei tratti in salita. Defaticamento mai omesso.
- **HIIT**: 4×4 norvegese (Helgerud 2007) solo per chi corre già 30′ continui; max 2×/sett, ≥48 h.
- **Scarico** ogni 4ª settimana (−30/40 % volume, nessuna seduta dura).

## Regole di programmazione applicate
1. Ogni seduta inizia e finisce camminando (3-5′); il generatore lo verifica.
2. Durate 15-55′; principianti 3 sedute/sett mai consecutive.
3. Ogni settimana con 3+ sedute ha strutture diverse: corta / media / lunga (o intervalli).
4. Velocità = punto di partenza al minimo del range; l'app invita a regolarle ("parla a frasi intere").
5. Tratto di corsa iniziale 1′/1′30″; salti del continuo ≤ 5′ a settimana.
6. Settimana di scarico ogni 4-5 settimane; "ripetere una settimana è previsto".
7. Pendenza esplicita per segmento (`incline`), letta da calorie, voce e schermata.
   Al primo ingresso l'app chiede se il tapis ha la pendenza regolabile (impostazione
   `treadmillIncline`, modificabile con "Cambia"). Se **no**: i tratti in salita diventano tratti
   più veloci in piano (camminata +0,3 km/h per ogni 1 %, max 6,5 km/h; corsa +0,25 km/h per 1 %,
   max +1,5) e il programma "Camminata in salita" (`requiresIncline`) resta non selezionabile.
8. Consigli psicologici per programma (campo `tips`), mostrati sotto la legenda.

## I 7 programmi
| Programma | Sett. | Sedute | Durata | Per chi |
|---|---|---|---|---|
| Da camminata a corsa | 10 | 3 | 27-39′ | Da zero a 30′ di corsa continua |
| Camminata attiva | 8 | 3 | 21-40′ | Ricominciare a muoversi senza correre |
| Dimagrimento | 8 | 4 | 30-52′ | Minuti/sett 120 → 210, 3 zona 2 + 1 variata |
| Resistenza: 5 km | 8 | 3 | 33-43′ | Chi corre già 20-25′; lunga +3′/sett |
| Intervalli intensi | 6 | 2 | 28-42′ | Chi corre 30′ continui; 1′/1′30″, salite, 4×4 |
| Recupero attivo | 1 | 2 | 16-20′ | Giorno dopo un allenamento duro; nessuna progressione |
| Camminata in salita | 8 | 3 | 26-40′ | Glutei e fiato senza impatto; +1 %/sett fino all'8 % |

Traguardi celebrati nei titoli delle sedute: primi 3′, 5′, 10′, 15′, 20′, 30′ continui; 30′ svelti;
5 km; 30′ all'8 %.

## Formato dati
```
programs[]: { id, name, icon, description, difficulty, totalWeeks, prerequisite, phases[], tips[],
              speedLegend[{level, speed, feeling}],
              weeks[{ week, sessionsPerWeek, totalDuration,
                      sessions[{ name, focus, totalDuration, segments[{activity, speed, duration, incline?}] }],
                      session  // = sessions[0], retrocompatibilità }] }
```
L'app (`App.jsx`) legge `sessions` se presente, altrimenti `session`; la seduta scelta (A/B/C) è
`selectedTreadmillSession`. Per modificare un piano si edita il generatore e si rilancia
`node scripts/build-treadmill.mjs`.

## Fonti principali
NHS Couch to 5K · Buist 2008 (BJSM) · Nielsen 2014 · Lee 2014 (JACC) · OMS 2020 · Jones & Doust 1996 ·
Compendium of Physical Activities · Galloway run/walk · Ekkekakis 2008 e dual-mode theory ·
meta-analisi intensità auto-selezionata 2015 (Frontiers) · talk test (ACE/Foster) · Muñoz/Seiler 2014 ·
Helgerud 2007 · Keating 2017 · ACSM 2018 (frequenza HIIT).
