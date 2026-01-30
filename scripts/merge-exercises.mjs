import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leggi i file JSON sorgente
const bodyweightPath = path.join(__dirname, '../external_assets/exercises/bodyweight_exercises.json');
const equipmentPath = path.join(__dirname, '../external_assets/exercises/with_equipment/exercises_catalog.json');
const outputPath = path.join(__dirname, '../external_assets/exercises/all_body/all_exercises.json');

const bodyweightExercises = JSON.parse(fs.readFileSync(bodyweightPath, 'utf8'));
const equipmentCatalog = JSON.parse(fs.readFileSync(equipmentPath, 'utf8'));

// Mapping dei muscoli in inglese per il campo "type"
const muscleTypeMapping = {
  // Italiano -> type
  'addominali': 'abs',
  'addominali bassi': 'abs',
  'obliqui': 'obliques',
  'core': 'core',
  'petto': 'chest',
  'tricipiti': 'triceps',
  'bicipiti': 'biceps',
  'spalle': 'shoulders',
  'schiena': 'back',
  'dorsali': 'back',
  'glutei': 'glutes',
  'quadricipiti': 'quadriceps',
  'femorali': 'hamstrings',
  'polpacci': 'calves',
  'gambe': 'legs',
  'braccia': 'arms',
  'flessori anca': 'hip_flexors',
  'adduttori': 'adductors',
  'equilibrio': 'balance',
  'cardio': 'cardio',
  'full body': 'full_body',
  'stretching': 'flexibility',
  'flessibilita': 'flexibility',
  'flessibilità': 'flexibility',
  'postura': 'posture',
  'rilassamento': 'recovery',
  'collo': 'neck',
  'mobilita': 'mobility',
  'mobilità': 'mobility',
  'anche': 'hips',
  'stabilita': 'core',
  'stabilità': 'core',
  // Inglese
  'chest': 'chest',
  'triceps': 'triceps',
  'biceps': 'biceps',
  'shoulders': 'shoulders',
  'abs': 'abs',
  'core': 'core',
  'obliques': 'obliques',
  'glutes': 'glutes',
  'quadriceps': 'quadriceps',
  'hamstrings': 'hamstrings',
  'calves': 'calves',
  'lats': 'back',
  'erector_spinae': 'back',
  'rhomboids': 'back',
  'trapezius': 'back',
  'rear_deltoid': 'shoulders',
  'deltoids': 'shoulders',
  'hip_flexors': 'hip_flexors',
  'adductors': 'adductors',
  'hip_abductors': 'hips',
  'forearms': 'arms',
  'wrist_flexors': 'arms',
  'neck': 'neck',
  'tibialis_anterior': 'legs',
  'soleus': 'calves',
  'piriformis': 'glutes',
  'lower_back': 'back'
};

// Funzione per determinare il tipo primario
function getPrimaryType(muscles) {
  if (!muscles || muscles.length === 0) return 'full_body';

  let muscleStr = '';
  if (Array.isArray(muscles)) {
    muscleStr = muscles[0] || '';
  } else {
    muscleStr = muscles.split(',')[0].trim();
  }

  muscleStr = muscleStr.toLowerCase();

  return muscleTypeMapping[muscleStr] || 'full_body';
}

// Funzione per convertire muscles in stringa
function musclesToString(muscles) {
  if (Array.isArray(muscles)) {
    // Converti da inglese a italiano
    const italianMuscles = muscles.map(m => {
      const mapping = {
        'chest': 'Petto',
        'triceps': 'Tricipiti',
        'biceps': 'Bicipiti',
        'shoulders': 'Spalle',
        'abs': 'Addominali',
        'core': 'Core',
        'obliques': 'Obliqui',
        'glutes': 'Glutei',
        'quadriceps': 'Quadricipiti',
        'hamstrings': 'Femorali',
        'calves': 'Polpacci',
        'lats': 'Dorsali',
        'erector_spinae': 'Erettori spinali',
        'rhomboids': 'Romboidi',
        'trapezius': 'Trapezio',
        'rear_deltoid': 'Deltoide posteriore',
        'deltoids': 'Deltoidi',
        'hip_flexors': 'Flessori anca',
        'adductors': 'Adduttori',
        'hip_abductors': 'Abduttori anca',
        'forearms': 'Avambracci',
        'wrist_flexors': 'Flessori polso',
        'neck': 'Collo',
        'tibialis_anterior': 'Tibiale anteriore',
        'soleus': 'Soleo',
        'piriformis': 'Piriforme',
        'lower_back': 'Lombare'
      };
      return mapping[m] || m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, ' ');
    });
    return italianMuscles.join(', ');
  }
  return muscles || '';
}

const unifiedExercises = {};

// Processa esercizi bodyweight
console.log('Processando esercizi bodyweight...');
for (const [key, exercise] of Object.entries(bodyweightExercises)) {
  const gifFile = `${key}.gif`;

  unifiedExercises[key] = {
    name: exercise.name,
    description: exercise.description,
    muscles: exercise.muscles,
    type: getPrimaryType(exercise.muscles),
    gif: gifFile
  };
}

console.log(`  - ${Object.keys(bodyweightExercises).length} esercizi bodyweight aggiunti`);

// Processa esercizi con attrezzi
console.log('Processando esercizi con attrezzi...');
let equipmentCount = 0;
for (const exercise of equipmentCatalog.exercises) {
  const key = exercise.newFile.replace('.gif', '');

  // Salta se esiste già (bodyweight ha priorità)
  if (unifiedExercises[key]) {
    console.log(`  - Skipping duplicate: ${key}`);
    continue;
  }

  unifiedExercises[key] = {
    name: exercise.name,
    description: exercise.description,
    muscles: musclesToString(exercise.muscles),
    type: getPrimaryType(exercise.muscles),
    gif: exercise.newFile
  };
  equipmentCount++;
}

console.log(`  - ${equipmentCount} esercizi con attrezzi aggiunti`);

// Ordina per chiave
const sortedExercises = {};
Object.keys(unifiedExercises).sort().forEach(key => {
  sortedExercises[key] = unifiedExercises[key];
});

// Scrivi il file JSON
fs.writeFileSync(outputPath, JSON.stringify(sortedExercises, null, 2), 'utf8');

console.log('');
console.log('========================================');
console.log('RIEPILOGO');
console.log('========================================');
console.log(`Totale esercizi: ${Object.keys(sortedExercises).length}`);
console.log(`File salvato: ${outputPath}`);
console.log('========================================');
