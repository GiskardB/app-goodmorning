# Pacchetto Android (TWA) per il Play Store

L'app "Rise" è una PWA. Per pubblicarla sul Play Store la si impacchetta come
**Trusted Web Activity (TWA)**: un guscio Android che apre la PWA a schermo intero.

## 1. Verifica di dominio (Digital Asset Links)

Perché la TWA parta senza barra del browser serve il file **`assetlinks.json`**
servito alla **radice del dominio** (non nel sottopercorso), cioè:

    https://giskardb.github.io/.well-known/assetlinks.json

Poiché l'app vive su `giskardb.github.io/app-goodmorning/`, il file NON può stare
in questo repo: va messo nel repo del **sito utente** `giskardb.github.io`
(vedi istruzioni sotto), dentro la cartella `.well-known/`.

Il file `assetlinks.json` in questa cartella è un **template**: va completato con
- `package_name` (già impostato: `io.github.giskardb.rise` — modificabile)
- `sha256_cert_fingerprints`: il fingerprint SHA-256 della chiave con cui firmi
  l'app. Lo ottieni da:
  - **Bubblewrap** al termine di `bubblewrap build`, oppure
  - **Google Play Console** → Rilascio → Configurazione → Integrità dell'app →
    "Firma dell'app di Google Play" (copia il fingerprint SHA-256).

## 2. Generare il pacchetto con Bubblewrap

    npm i -g @bubblewrap/cli
    bubblewrap init --manifest https://giskardb.github.io/app-goodmorning/manifest.webmanifest
    # rispondi alle domande (package: io.github.giskardb.rise, ecc.)
    bubblewrap build
    # produce app-release-signed.aab (da caricare sul Play Store) e il fingerprint

In alternativa, senza CLI: https://www.pwabuilder.com → incolla l'URL → Android → scarica.

## 3. Pubblicazione
- Crea l'app sulla **Google Play Console** (25 $ una tantum).
- Carica l'**.aab**.
- Copia il fingerprint SHA-256 in `assetlinks.json` e pubblicalo alla radice del dominio.
- Compila scheda store, privacy policy, classificazione contenuti, target API.
