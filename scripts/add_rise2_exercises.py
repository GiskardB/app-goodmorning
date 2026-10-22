#!/usr/bin/env python3
"""Aggiunge al registro gli esercizi di Rise 2.0 (scalette senza attrezzi) e
corregge alcune voci incoerenti. Le GIF sono in public/assets/rise2/."""
import json
P = '/home/user/app-goodmorning/public/exercises.json'
d = json.load(open(P))
nid = max(v['id'] for v in d.values()) + 1

NEW = {
  "push_up_wall": ("Push-up al muro", "In piedi di fronte a un muro, mani alla larghezza delle spalle all'altezza del petto, corpo in linea. Piega i gomiti avvicinando il petto al muro, poi spingi via. Primo gradino della scaletta delle spinte.", "Petto, Spalle, Tricipiti", "push", 1),
  "push_up_incline": ("Push-up inclinato", "Mani su un tavolo o divano stabile, corpo in linea dalla testa ai talloni. Scendi col petto verso il bordo mantenendo il core attivo, poi risali. Piu' basso e' l'appoggio, piu' e' difficile.", "Petto, Spalle, Tricipiti, Core", "push", 2),
  "prone_y": ("Sollevamento a Y prono", "Sdraiato a pancia in giu', braccia tese in avanti a formare una Y, pollici verso l'alto. Solleva le braccia di pochi centimetri stringendo le scapole verso il basso, tieni 1-2 secondi e riabbassa. Lavora trapezio inferiore e postura.", "Dorsali, Trapezio, Spalle", "back", 1),
  "prone_t": ("Sollevamento a T prono", "A pancia in giu', braccia aperte a T, pollici in alto. Solleva le braccia stringendo le scapole, tieni 1-2 secondi e riabbassa con controllo. Rinforza i romboidi e il trapezio medio.", "Dorsali, Trapezio, Deltoidi posteriori", "back", 2),
  "prone_w": ("Sollevamento a W prono", "A pancia in giu', gomiti piegati e braccia a formare una W. Solleva gomiti e mani portando le scapole indietro e in basso, tieni e riabbassa. Ottimo per spalle e postura.", "Dorsali, Trapezio, Deltoidi posteriori", "back", 2),
  "reverse_snow_angel": ("Angelo di neve inverso", "A pancia in giu', braccia lungo i fianchi sollevate da terra. Porta lentamente le braccia sopra la testa descrivendo un arco, senza toccare terra, poi torna ai fianchi. Movimento continuo e controllato.", "Dorsali, Trapezio, Deltoidi posteriori, Lombari", "back", 3),
  "wall_slide": ("Scivolamento scapolare al muro", "Schiena, testa e braccia a 'porta' contro il muro. Fai scivolare le braccia verso l'alto mantenendo gomiti e polsi a contatto con la parete, poi riscendi. Attiva il trapezio inferiore e apre le spalle.", "Trapezio, Spalle, Dorsali", "back", 1),
  "hip_hinge": ("Hip hinge a corpo libero", "In piedi, ginocchia leggermente piegate. Spingi i fianchi indietro facendo scendere il busto con la schiena piatta, mani che scivolano sulle cosce, fino a sentire tensione dietro le cosce; torna su stringendo i glutei.", "Glutei, Femorali, Lombari", "glutes", 2),
  "single_leg_glute_bridge": ("Ponte glutei monopodalico", "Sdraiato supino, un piede a terra e l'altra gamba tesa. Spingi col tallone a terra sollevando il bacino finche' spalle, fianchi e ginocchio sono in linea, tieni un istante e scendi. Cambia gamba a meta' tempo.", "Glutei, Femorali, Core", "glutes", 3),
  "single_leg_rdl": ("Stacco rumeno monopodalico", "In equilibrio su una gamba, piega il busto in avanti con la schiena piatta mentre l'altra gamba si estende indietro; la mano scende verso il piede d'appoggio. Torna in piedi contraendo il gluteo. Cambia gamba a meta' tempo.", "Glutei, Femorali, Core, Equilibrio", "glutes", 4),
  "bulgarian_split_squat": ("Split squat bulgaro", "Piede posteriore appoggiato su sedia o divano, gamba anteriore avanti. Scendi piegando il ginocchio anteriore fino a circa 90 gradi, busto eretto, poi risali. Cambia gamba a meta' tempo.", "Quadricipiti, Glutei, Femorali", "squat", 4),
  "prone_pull": ("Trazione prona", "A pancia in giu' con braccia tese in avanti e petto leggermente sollevato. Tira i gomiti indietro verso i fianchi come in una trazione, stringendo le scapole, poi estendi di nuovo le braccia. Simula la tirata senza attrezzi.", "Dorsali, Trapezio, Bicipiti, Lombari", "back", 3),
}
for key, (name, desc, muscles, typ, diff) in NEW.items():
    if key in d: print('gia presente:', key); continue
    d[key] = {"id": nid, "name": name, "description": desc, "muscles": muscles, "type": typ,
              "gif": f"assets/rise2/{key}.gif", "difficulty": diff, "wrongImage": False}
    nid += 1; print('aggiunto', key)

# Correzioni di voci incoerenti
d['butt_kicks'].update({"name": "Calci al sedere", "gif": "assets/rise2/butt_kicks.gif", "type": "cardio",
    "description": "Corsa sul posto portando i talloni verso i glutei a ritmo sostenuto, busto eretto e braccia che accompagnano. Riscalda femorali e polpacci.", "muscles": "Femorali, Polpacci, Cardio"})
d['shadow_boxing'].update({"name": "Pugilato a vuoto", "gif": "assets/rise2/shadow_boxing.gif", "type": "cardio",
    "description": "In posizione di guardia, alterna pugni diretti a vuoto ruotando busto e fianchi, gambe leggermente piegate e sempre in movimento. Cardio a basso impatto che coinvolge spalle e core.", "muscles": "Spalle, Core, Cardio"})
d['prone_y_raise']['type'] = 'abs'          # la GIF e' un V-Up: tipo coerente col nome
d['superman']['type'] = 'back'              # famiglia 'tirata' per le sostituzioni readiness
d['superman_swimmer']['type'] = 'back'

json.dump(d, open(P, 'w'), ensure_ascii=False, indent=2); open(P, 'a').write('\n')
print('totale esercizi:', len(d))
