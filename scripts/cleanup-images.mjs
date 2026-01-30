import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allBodyDir = path.join(__dirname, '../external_assets/exercises/all_body');
const jsonPath = path.join(allBodyDir, 'all_exercises.json');

// Leggi il JSON
const exercises = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Estrai tutti i nomi dei file GIF dal JSON
const referencedGifs = new Set();
for (const exercise of Object.values(exercises)) {
  referencedGifs.add(exercise.gif);
}

console.log('========================================');
console.log('PULIZIA IMMAGINI NON REFERENZIATE');
console.log('========================================');
console.log(`GIF referenziate nel JSON: ${referencedGifs.size}`);
console.log('');

// Ottieni tutti i file GIF nella cartella
const allFiles = fs.readdirSync(allBodyDir).filter(f => f.endsWith('.gif'));
console.log(`GIF presenti nella cartella: ${allFiles.length}`);
console.log('');

// Trova i file da eliminare
const filesToDelete = allFiles.filter(f => !referencedGifs.has(f));

if (filesToDelete.length === 0) {
  console.log('Nessun file da eliminare. Tutti i GIF sono referenziati.');
} else {
  console.log(`File da eliminare: ${filesToDelete.length}`);
  console.log('');

  for (const file of filesToDelete) {
    const filePath = path.join(allBodyDir, file);
    fs.unlinkSync(filePath);
    console.log(`ELIMINATO: ${file}`);
  }
}

console.log('');
console.log('========================================');
console.log('RIEPILOGO');
console.log('========================================');
console.log(`File eliminati: ${filesToDelete.length}`);
console.log(`File rimanenti: ${allFiles.length - filesToDelete.length}`);
console.log('========================================');
