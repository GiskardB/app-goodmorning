import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allBodyDir = path.join(__dirname, '../external_assets/exercises/all_body');
const jsonPath = path.join(allBodyDir, 'all_exercises.json');

const exercises = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const gifFiles = new Set(fs.readdirSync(allBodyDir).filter(f => f.endsWith('.gif')));

console.log('Verifico sincronizzazione JSON <-> GIF...\n');

// Trova esercizi con GIF mancante
const missingGifs = [];
for (const [key, exercise] of Object.entries(exercises)) {
  if (!gifFiles.has(exercise.gif)) {
    missingGifs.push({ key, gif: exercise.gif });
  }
}

// Trova GIF senza entry nel JSON
const exerciseGifs = new Set(Object.values(exercises).map(e => e.gif));
const orphanGifs = [...gifFiles].filter(g => !exerciseGifs.has(g));

if (missingGifs.length > 0) {
  console.log('ESERCIZI CON GIF MANCANTE:');
  missingGifs.forEach(m => console.log(`  - ${m.key}: ${m.gif}`));
} else {
  console.log('✓ Tutti gli esercizi hanno la GIF corrispondente');
}

console.log('');

if (orphanGifs.length > 0) {
  console.log('GIF SENZA ENTRY NEL JSON:');
  orphanGifs.forEach(g => console.log(`  - ${g}`));
} else {
  console.log('✓ Tutte le GIF hanno un entry nel JSON');
}

console.log('\n');
console.log(`Totale esercizi: ${Object.keys(exercises).length}`);
console.log(`Totale GIF: ${gifFiles.size}`);
