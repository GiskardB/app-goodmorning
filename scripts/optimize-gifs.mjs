import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import gifsicle from 'gifsicle';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gifDir = path.join(__dirname, '../external_assets/exercises/with_equipment');

// Ottieni tutti i file GIF
const gifFiles = fs.readdirSync(gifDir).filter(file => file.endsWith('.gif'));

console.log('========================================');
console.log('OTTIMIZZAZIONE GIF');
console.log('========================================');
console.log(`File da ottimizzare: ${gifFiles.length}`);
console.log('');

let processed = 0;
let totalSavedBytes = 0;
let errors = 0;

// Funzione per formattare i byte
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Processa i file in sequenza per evitare sovraccarico
async function processFile(file) {
  const inputPath = path.join(gifDir, file);
  const outputPath = path.join(gifDir, `optimized_${file}`);

  const originalSize = fs.statSync(inputPath).size;

  return new Promise((resolve) => {
    execFile(gifsicle, [
      '--optimize=3',
      '--colors', '128',
      '--lossy=80',
      '-o', outputPath,
      inputPath
    ], (error) => {
      if (error) {
        console.log(`ERRORE: ${file} - ${error.message}`);
        errors++;
        resolve();
        return;
      }

      try {
        const newSize = fs.statSync(outputPath).size;
        const saved = originalSize - newSize;
        const percentage = ((saved / originalSize) * 100).toFixed(1);

        // Sostituisci il file originale con quello ottimizzato
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);

        totalSavedBytes += saved;
        processed++;

        console.log(`OK: ${file} - ${formatBytes(originalSize)} -> ${formatBytes(newSize)} (-${percentage}%)`);
      } catch (e) {
        console.log(`ERRORE post-process: ${file} - ${e.message}`);
        errors++;
      }
      resolve();
    });
  });
}

async function main() {
  // Calcola dimensione totale iniziale
  let totalOriginalSize = 0;
  for (const file of gifFiles) {
    totalOriginalSize += fs.statSync(path.join(gifDir, file)).size;
  }
  console.log(`Dimensione totale iniziale: ${formatBytes(totalOriginalSize)}`);
  console.log('');

  // Processa tutti i file
  for (const file of gifFiles) {
    await processFile(file);
  }

  console.log('');
  console.log('========================================');
  console.log('RIEPILOGO');
  console.log('========================================');
  console.log(`File processati: ${processed}`);
  console.log(`Errori: ${errors}`);
  console.log(`Spazio risparmiato: ${formatBytes(totalSavedBytes)}`);
  console.log(`Dimensione finale: ${formatBytes(totalOriginalSize - totalSavedBytes)}`);
  console.log('========================================');
}

main().catch(console.error);
