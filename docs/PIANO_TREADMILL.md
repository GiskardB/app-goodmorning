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
   più veloci in piano (camminata +0,3 km/h per ogni 1 %, max 6,5 km/h a tratti brevi e 6 km/h oltre i 3′; corsa +0,25 km/h per 1 %,
   max +1,5) e il programma "Camminata in salita" (`requiresIncline`) resta non selezionabile.
8. Consigli psicologici per programma (campo `tips`), mostrati sotto la legenda.

## Livelli e intensità
Nell'app le settimane del piano si chiamano **Livelli**: chi si allena sceglie per tempo disponibile e
intensità, non per calendario, e può ripetere o saltare livelli liberamente. I campi dati restano
`week` e `totalWeeks`. Ogni seduta ha un indicatore di intensità da 1 a 5 (Leggera, Moderata,
Sostenuta, Impegnativa, Intensa) calcolato in `treadmillIntensity` (App.jsx): MET medio pesato sul
tempo più il 30 % della distanza dal picco dei tratti di almeno un minuto; soglie 3,6 / 5 / 6,3 / 7,4.
La frequenza ("3 sedute a settimana") resta solo come consiglio.

## Revisione scientifica dei livelli (novembre 2026)
Ogni seduta è stata ricontrollata; il generatore ora **rifiuta** i piani che violano le regole.

| Problema trovato | Correzione | Fondamento |
|---|---|---|
| Da camminata a corsa: i minuti di corsa salivano del 52 % tra livello 4 e 5 | Livelli 4-6 ribilanciati: 7 → 8,5 → 10,5 → 13,3 → 15,7 → 19,3 → 18,7 → 23,7 → 27,7 min di corsa a seduta, mai oltre +30 %; tratto continuo mai oltre +5′ | Nielsen 2014 (picchi > 30 %), punto di abbandono noto del C25K |
| Camminata continua a 6,5 km/h per 30-45′ (camminata attiva, dimagrimento) | Camminata continua mai oltre 6 km/h: l'intensità sale con la pendenza (1-3 %); 6,5 km/h solo a tratti di 2-3′ | Velocità di transizione cammino-corsa ≈ 7 km/h: sopra 6,5 il passo è innaturale e costa più della corsa (Hreljac 1993) |
| Dimagrimento: sedute fino a 55′ | Massimo 45′; dal livello 5 cresce l'intensità (pendenza, intervalli), non la durata: 120 → 180 min/sett | ACSM 2009: 150-250 min/sett; l'aderenza cala con sedute lunghe e monotone |
| Dimagrimento: corsa già al livello 1 per chi parte da zero | Livelli 1-2 con intervalli di passo a basso impatto, corsa leggera dal livello 3 e sempre sostituibile | Carico articolare nei principianti in sovrappeso; HIIT e continuo equivalenti a pari calorie (Wewege 2017, Keating 2017) |
| Resistenza 5 km: lunga fino a 45′ (55′ totali), variazioni da 2′ fino alla fine | Lunga fino a 40′ (≈ 5,3 km, +2′ a livello); ripetute da 3′ dal livello 6; minuti a ≥ 9,5 km/h sotto il 20 % | 80/20 (Seiler, Muñoz 2014); intervalli di 3-5′ per il tempo vicino al VO2max (Billat) |
| Intervalli intensi: stesso formato breve per tutti i livelli | Livello 5: 10 × 1′ con recupero 1′ | Protocollo a basso volume di Gibala (10 × 1′) |
| Calorie: la camminata svelta a 6,5 km/h usava l'equazione della corsa (+38 %) | Stima unica dello sforzo per calorie e intensità, con raccordo ai valori del Compendium tra 6 e 7,2 km/h | ACSM + Compendium of Physical Activities |
| Nessuna spiegazione dello scopo della seduta | Campo `why`: una riga "Perché" per ogni seduta | Dare una motivazione sostiene la motivazione autonoma (Deci 1994, SDT) |

Controlli automatici in `scripts/build-treadmill.mjs`: riscaldamento ≥ 5′ camminando se c'è corsa (≥ 3′
altrimenti) e defaticamento ≥ 3′; durata 15-50′ (15-45′ per camminata, salita e dimagrimento); camminata
oltre 6 km/h solo per 3′ al massimo; cambi di velocità ≤ 5 km/h; progressione della corsa ≤ +30 % e tratto
continuo ≤ +5′; minuti veloci ≤ 20 % nella resistenza.

## I 7 programmi
| Programma | Livelli | Sedute | Durata | Per chi |
|---|---|---|---|---|
| Da camminata a corsa | 10 | 3 | 25-42′ | Da zero a 30′ di corsa continua |
| Camminata attiva | 8 | 3 | 18-40′ | Ricominciare a muoversi senza correre |
| Dimagrimento | 8 | 4 | 25-45′ | 120 → 180 min/sett, 3 zona 2 + 1 variata |
| Resistenza: 5 km | 8 | 3 | 30-50′ | Chi corre già 20-25′; lunga +2′ a livello fino a 40′ |
| Intervalli intensi | 6 | 2 | 26-43′ | Chi corre 30′ continui; 1′/1′30″, salite, 4×4, 10×1 |
| Recupero attivo | 1 | 2 | 16-20′ | Giorno dopo un allenamento duro; nessuna progressione |
| Camminata in salita | 8 | 3 | 25-40′ | Glutei e fiato senza impatto; +1 % a livello fino all'8 % |

Traguardi nei titoli delle sedute: primi 4′, 5′, 10′, 15′, 20′, 30′ continui; 30′ svelti; 5 km; 30′ all'8 %.

## Formato dati
```
programs[]: { id, name, icon, description, difficulty, totalWeeks, prerequisite, phases[], tips[],
              speedLegend[{level, speed, feeling}],
              weeks[{ week, sessionsPerWeek, totalDuration,
                      sessions[{ name, focus, why, totalDuration, segments[{activity, speed, duration, incline?}] }],
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
