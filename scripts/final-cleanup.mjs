import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allBodyDir = path.join(__dirname, '../external_assets/exercises/all_body');
const cleanedJsonPath = path.join(allBodyDir, 'all_exercises_cleaned.json');
const finalJsonPath = path.join(allBodyDir, 'all_exercises.json');

// Leggi il JSON pulito
const exercises = JSON.parse(fs.readFileSync(cleanedJsonPath, 'utf8'));

// Estrai tutti i nomi dei file GIF dal JSON
const validGifs = new Set();
for (const exercise of Object.values(exercises)) {
  validGifs.add(exercise.gif);
}

console.log('========================================');
console.log('PULIZIA FINALE - IMMAGINI NON ESERCIZI');
console.log('========================================');
console.log(`Esercizi validi nel JSON: ${validGifs.size}`);
console.log('');

// Ottieni tutti i file GIF nella cartella
const allFiles = fs.readdirSync(allBodyDir).filter(f => f.endsWith('.gif'));
console.log(`GIF presenti nella cartella: ${allFiles.length}`);
console.log('');

// Trova i file da eliminare
const filesToDelete = allFiles.filter(f => !validGifs.has(f));

console.log('FILE DA ELIMINARE (non sono esercizi):');
console.log('--------------------------------------');

if (filesToDelete.length === 0) {
  console.log('Nessun file da eliminare.');
} else {
  for (const file of filesToDelete) {
    const filePath = path.join(allBodyDir, file);
    fs.unlinkSync(filePath);
    console.log(`  ✗ ${file}`);
  }
}

// Sostituisci il vecchio JSON con quello pulito
fs.copyFileSync(cleanedJsonPath, finalJsonPath);
fs.unlinkSync(cleanedJsonPath);

console.log('');
console.log('========================================');
console.log('RIEPILOGO');
console.log('========================================');
console.log(`File eliminati: ${filesToDelete.length}`);
console.log(`Esercizi finali: ${validGifs.size}`);
console.log(`GIF rimanenti: ${allFiles.length - filesToDelete.length}`);
console.log('JSON aggiornato: all_exercises.json');
console.log('========================================');
