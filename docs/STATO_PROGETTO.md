# Stato del progetto Rise — checkpoint

_Aggiornato: 2026-10-22_

## Cos'è
PWA React/Vite "Rise – 28 Giorni Calisthenics": allenamenti giornalieri a corpo libero
in 3 fasi da 28 giorni, con check-in pre-allenamento (readiness), adattamento
automatico dell'intensità, programma tapis roulant, libreria esercizi (214 voci con GIF).

- **Live**: https://giskardb.github.io/app-goodmorning/ (deploy automatico da `main` via GitHub Pages)
- **Branch di lavoro**: solo `main`. Il vecchio `claude/exercise-db-review-weights-ul3y2k` è stato
  eliminato in locale; quello remoto va rimosso a mano da GitHub (il proxy blocca il delete).
- **Dati**: `public/exercises.json` (registro), `public/workouts-phase{1,2,3}.json` (piani),
  `public/workout_treadmill.json`, `public/warmup_cooldown.json`.
  Le fasi si auto-rilevano: basta aggiungere `workouts-phaseN.json`.

## Fatto finora (ordine cronologico)
1. Revisione delle 208 GIF vs registro; campo `difficulty` 1–5; correzioni descrizioni/muscoli.
2. Difficoltà in UI (libreria + allenamento). Adattamento del workout al readiness score e alle
   zone indolenzite (DOMS), con anteprima delle sostituzioni.
3. Riprogettazione fasi 1–2 (split tematico e progressione). Rinomina app → "Rise".
4. Disclaimer medico (Informazioni + consenso obbligatorio in onboarding).
5. Identità visiva calda: palette **terracotta/ocra soft** (`--primary #C46A43`), niente emoji/stock,
   hero tipografiche, ombre ambient, sunburst SVG, texture, illustrazione sunrise (Stitch) in
   header home e card allenamento. Integrazione Stitch (mockup + design system).
6. **Calorie tapis roulant** corrette (formula ACSM: peso × velocità × pendenza).
7. **Fase 3**: 28 giorni ricostruiti da screenshot + 6 esercizi nuovi (GIF placeholder:
   `squat_kickback, squat_heel_raise, box_jump_4point, glute_bridge_abduction, plank_commando, plank_jack`).
8. **Tapis roulant**: le sessioni chiuse a metà vengono salvate come "parziale"; tracciamento
   della distanza (km) live e in cronologia.
9. **Play Store (prep)**: icona brandizzata "Rise", manifest allineato (colori, `id`),
   `twa/assetlinks.json` + `twa/README.md` con la procedura TWA/Bubblewrap.

## Aperto / prossimi passi
- Play Store: creare repo `giskardb.github.io` con `.well-known/assetlinks.json` (serve il
  fingerprint SHA-256 da Bubblewrap/Play Console); account Play Console; AAB.
- GIF reali per i 6 esercizi placeholder della Fase 3.
- **In corso**: studio approfondito dei piani (fasi 1–3) in ottica risultati + motivazione,
  basato su letteratura calisthenics e psicologia dell'aderenza.
