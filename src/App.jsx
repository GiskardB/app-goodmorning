import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initDB,
  getCompletedDays,
  markDayCompleted,
  getCurrentDay,
  setCurrentDay,
  addWorkoutHistory,
  getWorkoutHistory
} from './db';
import audioManager from './audio/AudioManager';

// Day to focus mapping (from GUIDA_MAPPATURA_WARMUP_COOLDOWN.md)
const DAY_FOCUS_MAP = {
  1: 'full_body', 2: 'upper_body', 3: 'core', 4: 'full_body',
  5: 'lower_body', 6: 'lower_body', 7: 'core', 8: 'lower_body',
  9: 'upper_body', 10: 'lower_body', 11: 'cardio', 12: 'core',
  13: 'upper_body', 14: 'lower_body', 15: 'core', 16: 'lower_body',
  17: 'upper_body', 18: 'core', 19: 'core', 20: 'full_body',
  21: 'full_body', 22: 'upper_body', 23: 'cardio', 24: 'lower_body',
  25: 'upper_body', 26: 'full_body', 27: 'upper_body', 28: 'cardio'
};

// Icons as SVG components
const PlayIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
  </svg>
);

const SkipIcon = () => (
  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
    <path d="M15.75 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75a.75.75 0 01.75-.75zM4.278 3.218a.75.75 0 01.772.04l8.25 5.5a.75.75 0 010 1.248l-8.25 5.5A.75.75 0 014 14.75V5.25a.75.75 0 01.278-.582z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const TimerIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FlameIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
  </svg>
);

// Audio icons - separate components for clarity
const VolumeOnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

// Navigation icons
const HomeIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
    {active ? (
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    )}
    {active && (
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
    )}
  </svg>
);

const ListIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.5"}>
    {active ? (
      <>
        <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </>
    )}
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

// Format seconds to MM:SS
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Check if URL is a video
const isVideo = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Get the full URL for media (handles both external URLs and local assets)
const getMediaUrl = (url) => {
  if (!url) return '';
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // For local assets, prepend the base URL
  return `${import.meta.env.BASE_URL}${url}`;
};

// Media component that handles both images and videos
const ExerciseMedia = ({ src, alt, className, style }) => {
  const mediaSrc = getMediaUrl(src);
  if (isVideo(src)) {
    return (
      <video
        src={mediaSrc}
        className={className}
        style={style}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }
  return (
    <img
      src={mediaSrc}
      alt={alt}
      className={className}
      style={style}
    />
  );
};

function App() {
  // State
  const [screen, setScreen] = useState('loading');
  const [day, setDay] = useState(1);
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [prep, setPrep] = useState(false);
  const [prepTimer, setPrepTimer] = useState(10);
  const [timer, setTimer] = useState(40);
  const [completed, setCompleted] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState({});
  const [warmupCooldownData, setWarmupCooldownData] = useState(null);
  const [error, setError] = useState(null);
  const [dbReady, setDbReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Phase: 'warmup' | 'workout' | 'cooldown' | 'rest'
  const [phase, setPhase] = useState('warmup');
  const [selectedWarmup, setSelectedWarmup] = useState(null);
  const [selectedCooldown, setSelectedCooldown] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({ warmup: [], workout: [], cooldown: [] });
  const [restTimer, setRestTimer] = useState(30);
  const [midWorkoutRestTaken, setMidWorkoutRestTaken] = useState(false);

  // PWA Install prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Bottom navigation tab: 'home' | 'exercises' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  // Selected exercise for detail view
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Wake Lock to prevent screen from turning off
  const wakeLockRef = useRef(null);

  const prepStartedRef = useRef(false);
  const workoutStartedRef = useRef(false);
  const elapsedIntervalRef = useRef(null);
  const elapsedTimeRef = useRef(0);

  // Initialize IndexedDB, load data, and setup audio
  useEffect(() => {
    async function loadData() {
      try {
        // Initialize IndexedDB
        await initDB();
        setDbReady(true);

        // Initialize Audio Manager
        audioManager.init(import.meta.env.BASE_URL);

        // Load exercises.json
        const exercisesRes = await fetch(`${import.meta.env.BASE_URL}exercises.json`);
        if (!exercisesRes.ok) throw new Error('Errore caricamento exercises.json');
        const exercisesData = await exercisesRes.json();
        setExercises(exercisesData);

        // Load workouts.json
        const workoutsRes = await fetch(`${import.meta.env.BASE_URL}workouts.json`);
        if (!workoutsRes.ok) throw new Error('Errore caricamento workouts.json');
        const workoutsData = await workoutsRes.json();

        // Load warmup_cooldown.json
        const warmupCooldownRes = await fetch(`${import.meta.env.BASE_URL}warmup_cooldown.json`);
        if (!warmupCooldownRes.ok) throw new Error('Errore caricamento warmup_cooldown.json');
        const warmupCooldownJson = await warmupCooldownRes.json();
        setWarmupCooldownData(warmupCooldownJson);

        // Enrich workouts with exercise data
        const enrichedWorkouts = workoutsData.days.map(workout => ({
          ...workout,
          exercises: workout.exercises.map(ex => ({
            ...exercisesData[ex.exercise_id],
            exercise_id: ex.exercise_id,
            duration: ex.duration
          }))
        }));

        setWorkouts(enrichedWorkouts);

        // Load progress from IndexedDB
        const completedDays = await getCompletedDays();
        setCompleted(completedDays);

        const savedDay = await getCurrentDay();
        setDay(savedDay);

        // Load workout history
        const history = await getWorkoutHistory(10);
        setWorkoutHistory(history);

        setScreen('home');
      } catch (err) {
        console.error('Errore caricamento dati:', err);
        setError(err.message);
        setScreen('error');
      }
    }

    loadData();
  }, []);

  // PWA Install prompt handler
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Wake Lock to prevent screen from turning off during workout
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && active && !paused) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock attivato');
        } catch (err) {
          console.log('Wake Lock non disponibile:', err.message);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock rilasciato');
      }
    };

    if (active && !paused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && active && !paused) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active, paused]);

  // Save current day to IndexedDB
  useEffect(() => {
    if (dbReady && day > 0) {
      setCurrentDay(day);
    }
  }, [day, dbReady]);

  // Track elapsed time during workout (only during actual exercises, not prep or rest)
  useEffect(() => {
    if (active && !paused && !prep && phase !== 'rest') {
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          elapsedTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } else {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    }

    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, [active, paused, prep, phase]);

  // Get current workout
  const curr = workouts.find(w => w.day === day);

  // Get current exercise list based on phase
  const getCurrentExercises = () => {
    if (phase === 'warmup' && selectedWarmup) {
      return selectedWarmup.exercises;
    } else if (phase === 'cooldown' && selectedCooldown) {
      return selectedCooldown.exercises;
    } else if (phase === 'workout') {
      return curr?.exercises || [];
    }
    return [];
  };

  const currentExercises = getCurrentExercises();
  const ex = currentExercises[exerciseIdx];
  const next = currentExercises[exerciseIdx + 1];
  const totalDuration = ex?.duration || 40;

  // Get phase label
  const getPhaseLabel = () => {
    switch (phase) {
      case 'warmup': return 'Riscaldamento';
      case 'cooldown': return 'Defaticamento';
      default: return curr?.title || 'Allenamento';
    }
  };

  // Get phase color
  const getPhaseColor = () => {
    switch (phase) {
      case 'warmup': return 'bg-blue-400';
      case 'cooldown': return 'bg-slate-600';
      default: return 'bg-workout';
    }
  };

  // Get phase code (warmup/cooldown ID)
  const getPhaseCode = () => {
    switch (phase) {
      case 'warmup': return selectedWarmup?.id || '';
      case 'cooldown': return selectedCooldown?.id || '';
      default: return '';
    }
  };

  // Handle TTS when prep starts
  useEffect(() => {
    if (active && prep && !prepStartedRef.current && ex) {
      prepStartedRef.current = true;
      audioManager.onPreparation(ex);
    }
    if (!prep) {
      prepStartedRef.current = false;
    }
  }, [active, prep, ex]);

  // Speak exercise description when exercise starts (prep ends)
  const exerciseStartedRef = useRef(false);
  useEffect(() => {
    if (active && !prep && phase !== 'rest' && ex && !exerciseStartedRef.current) {
      exerciseStartedRef.current = true;
      audioManager.onExerciseStart(ex);
    }
    if (prep) {
      exerciseStartedRef.current = false;
    }
  }, [active, prep, phase, ex]);

  // Start music when workout starts
  useEffect(() => {
    if (active && !workoutStartedRef.current) {
      workoutStartedRef.current = true;
      audioManager.startWorkout();
    }
    if (!active && workoutStartedRef.current) {
      workoutStartedRef.current = false;
    }
  }, [active]);

  // Prep timer
  useEffect(() => {
    if (active && prep && !paused && prepTimer > 0) {
      const interval = setInterval(() => {
        setPrepTimer(p => {
          // Trigger "GO" at 2 seconds before end
          audioManager.onPrepTick(p);

          if (p <= 1) {
            setPrep(false);
            setTimer(currentExercises[exerciseIdx]?.duration || 40);
            return 10;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [active, prep, paused, prepTimer, exerciseIdx, currentExercises]);

  // Handle moving to next phase
  const moveToNextPhase = useCallback(() => {
    if (phase === 'warmup') {
      // Move to main workout
      setPhase('workout');
      setExerciseIdx(0);
      setPrep(true);
      setPrepTimer(10);
    } else if (phase === 'workout') {
      // Move to cooldown
      setPhase('cooldown');
      setExerciseIdx(0);
      setPrep(true);
      setPrepTimer(10);
    } else if (phase === 'cooldown') {
      // Finish workout
      setActive(false);
      audioManager.finishWorkout(elapsedTimeRef.current);
      setScreen('done');
    }
  }, [phase]);

  // Execution timer with beep countdown
  useEffect(() => {
    if (active && !prep && !paused && phase !== 'rest' && timer > 0) {
      const interval = setInterval(() => {
        setTimer(p => {
          // Play beep for last 3 seconds
          if (p <= 3 && p >= 1) {
            audioManager.onExerciseTick(p);
          }

          if (p <= 1) {
            // Track completed exercise
            const completedEx = currentExercises[exerciseIdx];
            if (completedEx) {
              setCompletedExercises(prev => ({
                ...prev,
                [phase]: [...prev[phase], { name: completedEx.name, duration: completedEx.duration }]
              }));
            }

            const hasNext = exerciseIdx < currentExercises.length - 1;
            if (hasNext) {
              const nextIdx = exerciseIdx + 1;
              // Check if we're at the midpoint of workout phase and haven't taken rest
              const midpoint = Math.floor(currentExercises.length / 2);
              if (phase === 'workout' && nextIdx === midpoint && !midWorkoutRestTaken) {
                setMidWorkoutRestTaken(true);
                setPhase('rest');
                setRestTimer(30);
                audioManager.onRestStart();
                return currentExercises[nextIdx]?.duration || 40;
              }
              setExerciseIdx(nextIdx);
              setPrep(true);
              setPrepTimer(10);
            } else {
              // End of current phase, move to next
              moveToNextPhase();
            }
            return currentExercises[exerciseIdx + 1]?.duration || 40;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [active, prep, paused, timer, exerciseIdx, currentExercises, moveToNextPhase, phase, midWorkoutRestTaken]);

  // Rest timer for mid-workout pause
  useEffect(() => {
    if (active && phase === 'rest' && restTimer > 0) {
      const interval = setInterval(() => {
        setRestTimer(p => {
          if (p <= 1) {
            // Rest done, continue workout
            setPhase('workout');
            setExerciseIdx(prev => prev + 1);
            setPrep(true);
            setPrepTimer(10);
            audioManager.onResume();
            return 30;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [active, phase, restTimer]);

  // Handle pause/resume audio
  useEffect(() => {
    if (paused) {
      audioManager.onPause();
    } else if (active) {
      audioManager.onResume();
    }
  }, [paused, active]);

  // Select random warmup/cooldown based on day focus
  const selectWarmupCooldown = useCallback((dayNum) => {
    if (!warmupCooldownData) return { warmup: null, cooldown: null };

    const focus = DAY_FOCUS_MAP[dayNum] || 'full_body';

    const availableWarmups = warmupCooldownData.warmups.filter(w => w.focus === focus);
    const availableCooldowns = warmupCooldownData.cooldowns.filter(c => c.focus === focus);

    const randomWarmup = availableWarmups[Math.floor(Math.random() * availableWarmups.length)];
    const randomCooldown = availableCooldowns[Math.floor(Math.random() * availableCooldowns.length)];

    // Enrich warmup exercises
    const enrichWarmup = randomWarmup ? {
      ...randomWarmup,
      exercises: randomWarmup.exercises.map(ex => ({
        ...exercises[ex.exercise_id],
        exercise_id: ex.exercise_id,
        duration: ex.duration
      }))
    } : null;

    // Enrich cooldown exercises
    const enrichCooldown = randomCooldown ? {
      ...randomCooldown,
      exercises: randomCooldown.exercises.map(ex => ({
        ...exercises[ex.exercise_id],
        exercise_id: ex.exercise_id,
        duration: ex.duration
      }))
    } : null;

    return { warmup: enrichWarmup, cooldown: enrichCooldown };
  }, [warmupCooldownData, exercises]);

  // Mark day as completed
  const handleComplete = useCallback(async () => {
    // Save workout to history with exercise details
    const workoutTitle = curr?.title || `Giorno ${day}`;
    await addWorkoutHistory(day, elapsedTimeRef.current, workoutTitle, completedExercises);

    // Update history state
    const history = await getWorkoutHistory(10);
    setWorkoutHistory(history);

    if (!completed.includes(day)) {
      await markDayCompleted(day);
      setCompleted(prev => [...prev, day]);
    }
    setDay(Math.min(day + 1, 28));
    setScreen('home');
    setExerciseIdx(0);
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setPhase('warmup');
    setSelectedWarmup(null);
    setSelectedCooldown(null);
    setCompletedExercises({ warmup: [], workout: [], cooldown: [] });
    setMidWorkoutRestTaken(false);
    setRestTimer(30);
  }, [day, completed, curr, completedExercises]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newState = audioManager.toggle();
    setAudioEnabled(newState);
  }, []);

  // Get tip text based on exercise type
  const getTipText = (type) => {
    const tips = {
      plank: 'Mantieni il corpo in linea retta',
      push: 'Scendi lentamente, spingi con forza',
      squat: 'Ginocchia dietro le punte dei piedi',
      core: 'Mantieni il core contratto',
      cardio: 'Mantieni un ritmo costante',
      glutes: 'Stringi i glutei in alto',
      stretching: 'Respira profondamente',
      warmup: 'Preparati al meglio',
      cooldown: 'Rilassati e respira'
    };
    return tips[type] || 'Esegui con controllo';
  };

  // Start workout handler
  const startWorkout = () => {
    // Select warmup and cooldown for this day
    const { warmup, cooldown } = selectWarmupCooldown(day);
    setSelectedWarmup(warmup);
    setSelectedCooldown(cooldown);

    setActive(true);
    setPhase('warmup');
    setPrep(true);
    setPrepTimer(10);
    setExerciseIdx(0);
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setCompletedExercises({ warmup: [], workout: [], cooldown: [] });
    setMidWorkoutRestTaken(false);
    setRestTimer(30);
    setScreen('workout');
  };

  // Exit workout handler
  const exitWorkout = () => {
    setActive(false);
    audioManager.exitWorkout();
    setScreen('detail');
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setPhase('warmup');
    setSelectedWarmup(null);
    setSelectedCooldown(null);
    setCompletedExercises({ warmup: [], workout: [], cooldown: [] });
    setMidWorkoutRestTaken(false);
    setRestTimer(30);
  };

  // Skip to next phase
  const skipToNextPhase = () => {
    moveToNextPhase();
  };

  // Skip rest pause
  const skipRest = () => {
    setPhase('workout');
    setExerciseIdx(prev => prev + 1);
    setPrep(true);
    setPrepTimer(10);
    setRestTimer(30);
    audioManager.onResume();
  };

  // Install PWA handler
  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  // Audio toggle button component
  const AudioToggle = () => (
    <button
      onClick={toggleAudio}
      className="audio-toggle"
      type="button"
      aria-label={audioEnabled ? 'Disattiva audio' : 'Attiva audio'}
    >
      {audioEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
    </button>
  );

  // Bottom Navigation component
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface)]/95 backdrop-blur-sm border-t border-[var(--border)] px-2 py-1 z-50">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        <button
          onClick={() => { setActiveTab('home'); setScreen('home'); }}
          className={`flex flex-col items-center py-1 px-4 transition-colors ${activeTab === 'home' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <HomeIcon active={activeTab === 'home'} />
          <span className="text-[10px] mt-0.5">{activeTab === 'home' ? 'Home' : ''}</span>
        </button>
        <button
          onClick={() => { setActiveTab('exercises'); setScreen('exercises'); }}
          className={`flex flex-col items-center py-1 px-4 transition-colors ${activeTab === 'exercises' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <ListIcon active={activeTab === 'exercises'} />
          <span className="text-[10px] mt-0.5">{activeTab === 'exercises' ? 'Esercizi' : ''}</span>
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setScreen('settings'); }}
          className={`flex flex-col items-center py-1 px-4 transition-colors ${activeTab === 'settings' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
        >
          <SettingsIcon active={activeTab === 'settings'} />
          <span className="text-[10px] mt-0.5">{activeTab === 'settings' ? 'Altro' : ''}</span>
        </button>
      </div>
    </div>
  );

  // Loading Screen
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)] flex items-center justify-center">
        <div className="text-center text-white animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <FlameIcon />
          </div>
          <h1 className="text-xl font-semibold mb-2">Caricamento</h1>
          <p className="text-white/50 text-sm">Preparazione dei 28 giorni</p>
          <div className="mt-8">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (screen === 'error') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center animate-slide-up">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2">Errore di Caricamento</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  // Home Screen
  if (screen === 'home') {
    const nextDay = completed.includes(day) ? Math.min(day + 1, 28) : day;
    const displayWorkout = workouts.find(w => w.day === nextDay) || curr;
    const progressPercent = (completed.length / 28) * 100;

    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header */}
        <div className="bg-[var(--surface)] border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <h1 className="text-lg font-semibold">Il mio Piano</h1>
            <div className="flex items-center gap-2">
              {installPrompt && !isInstalled && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-full"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Installa
                </button>
              )}
              <div className="w-9 h-9 bg-[var(--primary)] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto py-2 px-3 mb-3">
          <div className="flex gap-1.5 items-center max-w-2xl mx-auto pb-1">
            {workouts.map((w) => {
              const isCompleted = completed.includes(w.day);
              const isCurrent = w.day === nextDay;
              const isFuture = w.day > nextDay;

              return (
                <div
                  key={w.day}
                  onClick={() => !isFuture && setDay(w.day)}
                  className={`day-card ${
                    isCompleted
                      ? 'day-card-completed'
                      : isCurrent
                      ? 'day-card-current'
                      : 'day-card-future'
                  }`}
                >
                  {!isFuture && <div className="text-[8px] opacity-50 uppercase">D</div>}
                  <div className={`font-semibold ${isFuture ? 'text-xs' : isCompleted ? 'text-sm' : 'text-base'}`}>{w.day}</div>
                  {isCompleted && <CheckIcon />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Card */}
        <div className="px-4 max-w-2xl mx-auto mb-4">
          <div className="header-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
                  <FlameIcon />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">{completed.length}/28</h2>
                  <p className="text-white/70 text-xs">allenamenti completati</p>
                </div>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Workout Card */}
        <div className="px-4 max-w-2xl mx-auto animate-slide-up">
          <div className="card overflow-hidden">
            <div className="relative h-24 bg-[var(--primary)] flex items-center justify-center">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{displayWorkout?.image}</span>
                <span className="text-white/90 text-sm font-medium bg-white/20 px-3 py-0.5 rounded-full">
                  Giorno {nextDay}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-1">{displayWorkout?.title}</h3>
              <div className="flex gap-3 mb-5 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <FlameIcon />
                  {displayWorkout?.calories} kcal
                </span>
                <span className="flex items-center gap-1">
                  <TimerIcon />
                  ~{(displayWorkout?.duration || 0) + 6} min
                </span>
                <span>{displayWorkout?.exercises?.length} esercizi</span>
              </div>
              <button
                onClick={() => {
                  setDay(nextDay);
                  setScreen('detail');
                }}
                className="btn-primary w-full"
              >
                VAI ALL'ALLENAMENTO
              </button>
            </div>
          </div>
        </div>

        {/* Workout History Section */}
        {workoutHistory.length > 0 && (
          <div className="px-4 max-w-2xl mx-auto mt-6 animate-fade-in">
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Sessioni completate
            </h3>
            <div className="card p-4">
              <div className="space-y-3">
                {workoutHistory.map((session, index) => {
                  const sessionDate = new Date(session.completedAt);
                  const formattedDate = sessionDate.toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={session.id || index}
                      onClick={() => {
                        setSelectedHistorySession(session);
                        setScreen('historyDetail');
                      }}
                      className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 cursor-pointer hover:bg-[var(--surface-hover)] rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-[var(--primary)]">D{session.day}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{session.workoutTitle}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{formattedDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                          <TimerIcon />
                          <span>{formatTime(session.duration)}</span>
                        </div>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[var(--text-muted)]">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="h-14"></div>
        <AudioToggle />
        <BottomNav />
      </div>
    );
  }

  // Exercises List Screen
  if (screen === 'exercises') {
    const exercisesList = Object.entries(exercises).map(([id, ex]) => ({
      id,
      ...ex
    }));

    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header */}
        <div className="bg-[var(--surface)] border-b border-[var(--border)] p-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-lg font-semibold">Tutti gli Esercizi</h1>
            <p className="text-sm text-[var(--text-secondary)]">{exercisesList.length} esercizi disponibili</p>
          </div>
        </div>

        {/* Exercises List */}
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="space-y-3">
            {exercisesList.map((exercise) => (
              <div
                key={exercise.id}
                className="card p-4 animate-fade-in cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                onClick={() => {
                  setSelectedExercise(exercise);
                  setScreen('exerciseDetail');
                }}
              >
                <div className="flex gap-4 items-center">
                  <div className="flex-shrink-0 overflow-hidden rounded-xl">
                    <ExerciseMedia
                      src={exercise.gif}
                      alt={exercise.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{exercise.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex gap-2">
                      {exercise.muscles && (
                        <span className="chip chip-light text-xs">
                          {exercise.muscles}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-[var(--text-muted)] flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-14"></div>
        <AudioToggle />
        <BottomNav />
      </div>
    );
  }

  // Exercise Detail Screen
  if (screen === 'exerciseDetail' && selectedExercise) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header with back button */}
        <div className="bg-[var(--surface)] border-b border-[var(--border)] p-4">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => {
                setSelectedExercise(null);
                setScreen('exercises');
              }}
              className="w-10 h-10 rounded-full bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)]"
            >
              <BackIcon />
            </button>
            <h1 className="text-lg font-semibold truncate">{selectedExercise.name}</h1>
          </div>
        </div>

        {/* Exercise Media - Large */}
        <div className="flex justify-center py-6 bg-[var(--surface)]">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <ExerciseMedia
              src={selectedExercise.gif}
              alt={selectedExercise.name}
              className="w-72 h-72 object-cover"
            />
          </div>
        </div>

        {/* Exercise Info */}
        <div className="px-4 max-w-2xl mx-auto py-6">
          <div className="card p-5 animate-slide-up">
            {/* Name */}
            <h2 className="text-xl font-bold mb-4">{selectedExercise.name}</h2>

            {/* Muscles */}
            {selectedExercise.muscles && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Muscoli coinvolti
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.muscles.split(', ').map((muscle, i) => (
                    <span key={i} className="chip chip-primary text-sm">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Type */}
            {selectedExercise.type && (
              <div className="mb-4">
                <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Tipologia
                </h3>
                <span className="chip chip-light text-sm capitalize">
                  {selectedExercise.type}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                Come eseguirlo
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {selectedExercise.description}
              </p>
            </div>
          </div>
        </div>

        <div className="h-14"></div>
        <AudioToggle />
        <BottomNav />
      </div>
    );
  }

  // Settings Screen (placeholder)
  if (screen === 'settings') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header */}
        <div className="bg-[var(--surface)] border-b border-[var(--border)] p-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-lg font-semibold">Impostazioni</h1>
          </div>
        </div>

        <div className="px-4 py-8 max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-[var(--text-secondary)]">Prossimamente...</p>
        </div>

        <div className="h-14"></div>
        <AudioToggle />
        <BottomNav />
      </div>
    );
  }

  // Detail Screen
  if (screen === 'detail') {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <div className="relative">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setScreen('home')}
              className="w-10 h-10 bg-[var(--surface)] rounded-full flex items-center justify-center border border-[var(--border)]"
            >
              <BackIcon />
            </button>
          </div>
          <div className="h-48 bg-[var(--primary)] flex items-center justify-center">
            <span className="text-7xl">{curr?.image}</span>
          </div>
        </div>

        <div className="px-4 max-w-2xl mx-auto -mt-6 relative z-10">
          <div className="card p-5 animate-slide-up">
            <h2 className="text-xl font-bold mb-2">{curr?.title}</h2>
            <div className="flex gap-3 mb-5 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <FlameIcon />
                {curr?.calories} kcal
              </span>
              <span className="flex items-center gap-1">
                <TimerIcon />
                ~{(curr?.duration || 0) + 6} min
              </span>
            </div>

            {/* Workout structure info */}
            <div className="bg-[var(--surface-hover)] rounded-lg p-3 mb-5 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span>Riscaldamento (~3 min)</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
                <span>Allenamento ({curr?.exercises?.length} esercizi)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <span>Defaticamento (~3 min)</span>
              </div>
            </div>

            <button onClick={startWorkout} className="btn-primary w-full mb-5">
              ANDIAMO!
            </button>

            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Piano di allenamento
            </h3>
            <div className="space-y-2">
              {curr?.exercises?.map((exercise, i) => (
                <div key={i} className="exercise-card">
                  <ExerciseMedia
                    src={exercise.gif}
                    alt={exercise.name}
                    className="exercise-thumbnail"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{exercise.name}</div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <TimerIcon />
                      {exercise.duration} sec
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-24"></div>
        <AudioToggle />
      </div>
    );
  }

  // Workout Screen - Preparation
  if (screen === 'workout' && prep) {
    const prepBgColor = phase === 'warmup' ? 'bg-blue-400' : phase === 'cooldown' ? 'bg-slate-600' : 'bg-prep';
    const phaseCode = getPhaseCode();

    return (
      <div className={`min-h-screen ${prepBgColor} text-white flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="chip chip-dark">{getPhaseLabel()}</div>
            {phaseCode && <span className="text-[10px] text-white/60 mt-1 ml-1">{phaseCode}</span>}
          </div>
          <button
            onClick={exitWorkout}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <p className="text-white/60 uppercase tracking-wider text-xs mb-2">Prossimo</p>
          <h2 className="text-xl font-semibold text-center mb-6">{ex?.name}</h2>

          <div className="timer-display mb-6">{prepTimer}</div>

          <div className="mb-6 overflow-hidden rounded-2xl">
            <ExerciseMedia
              src={ex?.gif}
              alt={ex?.name}
              className="w-36 h-36 rounded-2xl object-cover"
            />
          </div>

          <p className="text-white/60 text-sm mb-8">Durata: {ex?.duration}s</p>

          <button
            onClick={() => {
              setPrep(false);
              setTimer(ex?.duration || 40);
            }}
            className="btn-flat flex items-center gap-2"
          >
            <PlayIcon />
            Comincia!
          </button>
        </div>

        <AudioToggle />
      </div>
    );
  }

  // Rest Screen - Mid-workout pause
  if (screen === 'workout' && phase === 'rest') {
    return (
      <div className="min-h-screen bg-white text-[var(--text)] flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="chip chip-light">Pausa</div>
          <button
            onClick={exitWorkout}
            className="w-10 h-10 rounded-full bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <p className="text-[var(--text-secondary)] uppercase tracking-wider text-xs mb-4">Riposa</p>

          <div className="timer-display text-[var(--primary)] mb-8">{restTimer}</div>

          <p className="text-[var(--text-secondary)] text-center mb-8 max-w-xs">
            Prenditi un momento per riprendere fiato prima di continuare
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setRestTimer(prev => prev + 30)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Aggiungi 30 sec
            </button>
            <button
              onClick={skipRest}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <SkipIcon />
              Salta pausa
            </button>
          </div>
        </div>

        <AudioToggle />
      </div>
    );
  }

  // Workout Screen - Execution
  if (screen === 'workout') {
    const progress = ((totalDuration - timer) / totalDuration) * 100;
    const bgColor = phase === 'warmup' ? 'bg-blue-500' : phase === 'cooldown' ? 'bg-slate-700' : 'bg-workout';
    const phaseCode = getPhaseCode();

    return (
      <div className={`min-h-screen ${bgColor} text-white flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="chip chip-dark">
              {getPhaseLabel()} {exerciseIdx + 1}/{currentExercises.length}
            </div>
            {phaseCode && <span className="text-[10px] text-white/60 mt-1 ml-1">{phaseCode}</span>}
          </div>
          <button
            onClick={exitWorkout}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Elapsed time indicator */}
        <div className="flex justify-center">
          <div className="bg-white/10 px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <TimerIcon />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="relative mb-4 animate-fade-in overflow-hidden rounded-3xl w-fit">
            <ExerciseMedia
              src={ex?.gif}
              alt={ex?.name}
              className="max-h-72 rounded-3xl"
              style={{
                filter: paused ? 'grayscale(100%)' : 'none',
                opacity: paused ? 0.4 : 1,
                transition: 'all 0.3s ease'
              }}
            />
            {paused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/70 px-5 py-2 rounded-full text-sm font-medium">
                  IN PAUSA
                </div>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className={`timer-display-sm mb-2 ${timer <= 3 ? 'text-sky-200 animate-pulse-soft' : ''}`}>
            {timer}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs progress-bar mb-4">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Tip */}
          <div className="chip chip-info mb-4">
            {getTipText(ex?.type || phase)}
          </div>

          <h2 className="text-lg font-semibold text-center mb-5">{ex?.name}</h2>

          {/* Controls */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setPaused(!paused)}
              className="btn-secondary flex items-center gap-2"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
              {paused ? 'Riprendi' : 'Pausa'}
            </button>
            {import.meta.env.DEV && (
              <button
                onClick={() => {
                  const hasNext = exerciseIdx < currentExercises.length - 1;
                  if (hasNext) {
                    setExerciseIdx(prev => prev + 1);
                    setPrep(true);
                    setPrepTimer(10);
                  } else {
                    moveToNextPhase();
                  }
                }}
                className="btn-flat flex items-center gap-2"
              >
                <SkipIcon />
                Salta
              </button>
            )}
          </div>

          {/* Next exercise preview */}
          {next && (
            <div className="bg-white/5 rounded-xl p-3 w-full max-w-sm">
              <p className="text-xs text-white/50 mb-2">Prossimo:</p>
              <div className="flex items-center gap-3">
                <ExerciseMedia
                  src={next.gif}
                  alt={next.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <div className="font-medium text-sm">{next.name}</div>
                  <div className="text-xs text-white/50">{next.duration}s</div>
                </div>
              </div>
            </div>
          )}

          {/* Phase indicator */}
          {!next && phase !== 'cooldown' && (
            <div className="bg-white/5 rounded-xl p-3 w-full max-w-sm text-center">
              <p className="text-xs text-white/50">
                Dopo: {phase === 'warmup' ? 'Allenamento principale' : 'Defaticamento'}
              </p>
            </div>
          )}
        </div>

        <AudioToggle />
      </div>
    );
  }

  // Done Screen
  if (screen === 'done') {
    return (
      <div className="min-h-screen bg-blue-600 text-white flex items-center justify-center p-4">
        <div className="text-center animate-slide-up">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-1">Fantastico!</h1>
          <p className="text-lg text-white/80 mb-8">{curr?.title}</p>

          <div className="flex gap-3 justify-center mb-8">
            <div className="stat-card">
              <div className="text-2xl font-bold">{curr?.calories}</div>
              <div className="text-xs text-white/60">kcal</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-white/60">tempo</div>
            </div>
            <div className="stat-card">
              <div className="text-2xl font-bold">{curr?.exercises?.length}</div>
              <div className="text-xs text-white/60">esercizi</div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="bg-white text-blue-600 px-10 py-3 rounded-full font-semibold"
          >
            Continua
          </button>
        </div>
      </div>
    );
  }

  // History Detail Screen
  if (screen === 'historyDetail' && selectedHistorySession) {
    const session = selectedHistorySession;
    const sessionDate = new Date(session.completedAt);
    const formattedDate = sessionDate.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const exerciseDetails = session.exerciseDetails || { warmup: [], workout: [], cooldown: [] };
    const warmupExercises = exerciseDetails.warmup || [];
    const workoutExercises = exerciseDetails.workout || [];
    const cooldownExercises = exerciseDetails.cooldown || [];

    const totalWarmupTime = warmupExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    const totalWorkoutTime = workoutExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    const totalCooldownTime = cooldownExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);

    return (
      <div className="min-h-screen bg-[var(--bg)]">
        {/* Header */}
        <div className="bg-[var(--dark-bg)] text-white p-4">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => {
                setSelectedHistorySession(null);
                setScreen('home');
              }}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{session.workoutTitle}</h1>
              <p className="text-sm text-white/60">Giorno {session.day}</p>
            </div>
          </div>
        </div>

        <div className="px-4 max-w-2xl mx-auto py-6">
          {/* Session Info */}
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{formattedDate}</p>
              </div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <TimerIcon />
                <span>{formatTime(session.duration)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-400/10 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-400">{warmupExercises.length}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">Risc.</div>
              </div>
              <div className="bg-[var(--primary)]/10 rounded-lg p-2">
                <div className="text-lg font-bold text-[var(--primary)]">{workoutExercises.length}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">Workout</div>
              </div>
              <div className="bg-slate-600/20 rounded-lg p-2">
                <div className="text-lg font-bold text-slate-500">{cooldownExercises.length}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">Defat.</div>
              </div>
            </div>
          </div>

          {/* Warmup Exercises */}
          {warmupExercises.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <h3 className="text-sm font-medium">Riscaldamento</h3>
                <span className="text-xs text-[var(--text-secondary)]">({formatTime(totalWarmupTime)})</span>
              </div>
              <div className="card p-3 space-y-2">
                {warmupExercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{ex.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{ex.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workout Exercises */}
          {workoutExercises.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>
                <h3 className="text-sm font-medium">Allenamento</h3>
                <span className="text-xs text-[var(--text-secondary)]">({formatTime(totalWorkoutTime)})</span>
              </div>
              <div className="card p-3 space-y-2">
                {workoutExercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{ex.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{ex.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooldown Exercises */}
          {cooldownExercises.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <h3 className="text-sm font-medium">Defaticamento</h3>
                <span className="text-xs text-[var(--text-secondary)]">({formatTime(totalCooldownTime)})</span>
              </div>
              <div className="card p-3 space-y-2">
                {cooldownExercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{ex.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{ex.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no exercise details */}
          {warmupExercises.length === 0 && workoutExercises.length === 0 && cooldownExercises.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-[var(--text-secondary)]">Dettagli esercizi non disponibili per questa sessione</p>
            </div>
          )}
        </div>

        <div className="h-24"></div>
      </div>
    );
  }

  return null;
}

export default App;
