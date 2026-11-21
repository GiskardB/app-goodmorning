# Valutazione dell'app da personal trainer

_Novembre 2026. Valutazione dell'app nel suo insieme rispetto alle linee guida e alla letteratura,
con le modifiche fatte e quelle rimandate._

## Metro di giudizio
Un programma completo per adulti copre quattro componenti (OMS 2020; ACSM, Garber 2011):

| Componente | Dose raccomandata | Prima della revisione |
|---|---|---|
| Aerobico | 150-300 min/sett moderati (o 75-150 vigorosi) | Solo per chi ha il tapis roulant |
| Forza | Tutti i gruppi muscolari, almeno 2 giorni/sett | Coperta: 3 sedute, 6 serie/sett per schema motorio |
| Flessibilità | 2-3 giorni/sett | Coperta: 3 giorni leggeri + 1 di recupero |
| Neuromotorio (equilibrio) | 2-3 giorni/sett, prioritario oltre i 65 anni | Quasi assente |
| Sedentarietà | Interrompere le ore seduti | Assente |

## Cosa funzionava già
- Forza: il volume basta (Iversen 2021: almeno 4 serie/sett per gruppo muscolare; qui 6).
- Sedute brevi, check-in che adatta l'intensità, "minimo vitale", settimana valida con 2 sedute su 3:
  tutte scelte coerenti con la letteratura sull'aderenza (obiettivi con riserva, streak "riparabili").
- Tapis roulant: 7 programmi già rivisti con regole verificate dal generatore.

## Le lacune, in ordine di impatto
1. **Nessun aerobico per chi non ha il tapis roulant.** Tre sedute di forza da 20 minuti lasciano a zero i
   150 minuti settimanali.
2. **Nessun contatore settimanale.** L'automonitoraggio unito a un obiettivo è la combinazione con più
   evidenza per il cambiamento di comportamento (Michie 2009).
3. **Nessuna pausa attiva.** Interrompere la sedentarietà ha effetti acuti dimostrati su glicemia e
   insulina (Dunstan 2012); gli "exercise snacks" migliorano la forma cardiorespiratoria (Jenkins 2019).
4. **Forza a tempo senza riferimento di sforzo.** Con carichi bassi conta arrivare vicino al cedimento
   (Schoenfeld 2017): 30-35 secondi di una variante facile possono restarne lontani.
5. **Equilibrio e respirazione** poco presenti.
6. **Difetto tecnico**: le sessioni di tapis roulant entravano nelle statistiche del piano a corpo libero
   (sforzo medio, readiness, sedute recenti usate dalle regole di adattamento), falsandole.

## Cosa è stato fatto
| Lacuna | Intervento | Fondamento |
|---|---|---|
| 1 | **Nuovo allenamento "Cardio a corpo libero"**: 3 livelli da 10, 15 e 19 minuti, senza salti (un piede sempre a terra), rapporti lavoro/recupero 1:1 → 2:1 → 3:1, sforzo 4-7 su 10 | OMS 2020; sopra la soglia ventilatoria il piacere cala (Ekkekakis 2011), quindi niente sforzi massimali |
| 2 | **"La tua settimana"** in home: minuti di cardio con obiettivo graduale (30 → 60 → 90 → 120 → 150), giorni di forza su 2, giorni attivi, pause attive | Michie 2009; qualunque quantità aiuta (Arem 2015); l'OMS chiede di iniziare con poco e aumentare |
| 3 | **"Pause attive"**: 4 sessioni da 3-4 minuti (sblocca-sedia, snack energia, forza-snack, equilibrio e respiro) | Dunstan 2012, Jenkins 2019, Islam 2022 |
| 4 | Indicazione **"Come lavorare oggi"** nei giorni di forza (discesa in 2-3 secondi, 2-3 ripetizioni di margine) e suggerimenti tecnici aggiornati | Iversen 2021, Schoenfeld 2017 |
| 5 | **Equilibrio su una gamba** nei 3 giorni leggeri; famiglia **"Respiro e rilassamento"** con cerchio che guida 4 secondi di inspirazione e 6 di espirazione | ACSM (neuromotorio 2-3 giorni/sett); Zaccaro 2018, Laborde 2019 |
| 6 | Le statistiche del piano ora ignorano tapis roulant e sessioni extra | Correttezza dei dati |

Le sessioni extra non toccano il piano dei 28 giorni: si aggiungono quando si vuole (il cardio è suggerito
nei giorni leggeri), non chiedono check-in né feedback, e se interrotte registrano comunque quanto fatto.
Cinque esercizi nuovi con animazione: jack senza salto, pattinatore senza salto, calci frontali alternati,
alzarsi dalla sedia, respiro lento da seduti.

### Come si contano i minuti
- **Cardio**: tapis roulant, cardio a corpo libero, snack energia. Ogni minuto vale uno: i minuti vigorosi
  non sono raddoppiati, per restare prudenti.
- **Forza**: indicatore separato (giorni su 2), come nelle linee guida.
- **Non contano** come cardio: mobilità, stretching, pause leggere, respirazione.
- **Obiettivo**: il gradino successivo a quanto fatto la settimana scorsa. Dopo una settimana storta
  l'obiettivo torna alla portata invece di restare un rimprovero.

## Cosa resta da fare (non incluso)
- **Profilo non usato per scegliere la fase di partenza**: obiettivo ed esperienza vengono chiesti ma il
  piano parte sempre dalla Fase 1.
- **Test mensile non collegato alla scelta delle varianti**: oggi il test misura, ma non assegna la variante.
- **Tirata**: senza attrezzi resta lo schema più debole (solo esercizi da prono). Un elastico o una fascia
  la migliorerebbero molto.
- **Oltre i 65 anni** servirebbe una seduta di equilibrio dedicata 3 volte a settimana.
- **Piano "se-allora"** ("mi alleno dopo il caffè") e promemoria: evidenza buona, ma senza notifiche l'effetto è limitato.

## Affidabilità dell'evidenza
- **Solida**: linee guida OMS, dose-risposta sulla mortalità, volume di forza.
- **Solo osservazionale**: benefici dei brevi spunti vigorosi nella vita quotidiana (Stamatakis 2022).
- **Debole o su piccoli campioni**: exercise snacks, respirazione e sonno, psicologia delle streak.
- **Solo effetti acuti**: pause dalla sedentarietà.
- Nessuno studio controllato ha testato questi esatti protocolli di cardio a basso impatto su sedentari:
  durate e rapporti sono derivati dalle fonti, non copiati da un trial.

## File
- `scripts/build-extras.mjs` → `public/extra_sessions.json` (sessioni extra, con controlli: riscaldamento,
  defaticamento, nessun salto nel cardio).
- `scripts/gen_rise2_gifs.cjs` (animazioni), `scripts/build-plans.mjs` (equilibrio nei giorni leggeri).
- `src/App.jsx`: `weeklySummary`, schermata `extras`, `startExtraSession` / `finishExtraSession`.
