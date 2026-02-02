// Sound Effects - Using Web Audio API for beep countdown
class SoundFX {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playBeep(frequency = 800, duration = 0.18, volume = 0.5) {
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) return;

    // Resume context if suspended (iOS requirement)
    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.value = volume;

    // Fade out for smoother sound
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCountdownBeep(secondsRemaining) {
    // Professional gym-style countdown ticks
    // Ascending pitch creates anticipation (4 seconds countdown)
    if (secondsRemaining === 4) {
      this.playTick(392, 0.12, 0.45); // G4 - lowest tick
    } else if (secondsRemaining === 3) {
      this.playTick(440, 0.12, 0.4); // A4 - low tick
    } else if (secondsRemaining === 2) {
      this.playTick(554, 0.12, 0.45); // C#5 - medium tick
    } else if (secondsRemaining === 1) {
      this.playTick(659, 0.15, 0.6); // E5 - high tick
      // Final confirmation tone
      setTimeout(() => this.playTick(880, 0.2, 0.55), 150); // A5 - resolution
    }
  }

  playTick(frequency, duration = 0.1, volume = 0.4) {
    if (!this.audioContext) {
      this.init();
    }
    if (!this.audioContext) return;

    this.resume();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Create a cleaner, more pleasant tone
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle'; // Softer than sine

    // Low-pass filter for smoother sound
    filter.type = 'lowpass';
    filter.frequency.value = frequency * 2;
    filter.Q.value = 1;

    // Quick attack, smooth decay
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Smooth decay

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }
}

// Text-to-Speech for exercise descriptions
class WorkoutVoice {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voice = null;
    this.enabled = true;
    this.voicesLoaded = false;
    this.initVoice();
  }

  initVoice() {
    const setVoice = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length === 0) return;

      this.voicesLoaded = true;

      // Priority list for Italian voices (prefer more natural ones)
      const preferredVoices = [
        'Google italiano',
        'Microsoft Elsa',
        'Microsoft Isabella',
        'Alice',
        'Federica',
        'Luca',
      ];

      // Try to find a preferred voice
      for (const preferred of preferredVoices) {
        const found = voices.find(v =>
          v.name.includes(preferred) && v.lang.startsWith('it')
        );
        if (found) {
          this.voice = found;
          return;
        }
      }

      // Fallback: any Italian voice
      this.voice = voices.find(v => v.lang.startsWith('it-IT')) ||
                   voices.find(v => v.lang.startsWith('it')) ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0];
    };

    // Try immediately
    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    }

    // Also listen for voices loaded event
    this.synthesis.addEventListener('voiceschanged', setVoice);
  }

  speak(text, options = {}) {
    if (!this.enabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.lang = 'it-IT';
    // Slightly slower rate for more natural sound
    utterance.rate = options.rate || 0.9;
    // Natural pitch
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.85;

    this.synthesis.speak(utterance);
  }

  speakGo() {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance('Via!');
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'it-IT';
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    this.synthesis.speak(utterance);
  }

  speakCompletion(elapsedTime) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    this.synthesis.cancel();

    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    let timeText = '';
    if (minutes > 0) {
      timeText = `${minutes} minuti e ${seconds} secondi`;
    } else {
      timeText = `${seconds} secondi`;
    }

    const text = `Bene, hai concluso l'allenamento in ${timeText}!`;

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'it-IT';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    this.synthesis.speak(utterance);
  }

  speakExit() {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    this.synthesis.cancel();

    const text = 'Non hai completato l\'allenamento, peccato!';

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = 'it-IT';
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    utterance.volume = 0.9;

    this.synthesis.speak(utterance);
  }

  stop() {
    this.synthesis.cancel();
  }

  getAvailableVoices() {
    const voices = this.synthesis.getVoices();
    // Filter to Italian voices primarily, but include some English as fallback
    const italianVoices = voices.filter(v => v.lang.startsWith('it'));
    const englishVoices = voices.filter(v => v.lang.startsWith('en')).slice(0, 3);
    return [...italianVoices, ...englishVoices];
  }

  setVoice(voiceName) {
    const voices = this.synthesis.getVoices();
    const found = voices.find(v => v.name === voiceName);
    if (found) {
      this.voice = found;
      return true;
    }
    return false;
  }

  getCurrentVoiceName() {
    return this.voice?.name || null;
  }
}

// Background Music Player
class BackgroundMusic {
  constructor() {
    this.audio = null;
    this.allTracks = []; // All available tracks with metadata
    this.playlist = []; // Filtered playlist (favorites or all)
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.08; // Low volume
    this.basePath = '';
    this.favorites = []; // List of favorite track filenames
    this.previewAudio = null; // For previewing tracks
  }

  loadPlaylist(basePath = '') {
    this.basePath = basePath;

    // Dynamically load all music files from the music folder using Vite's glob import
    // This automatically detects all mp3 files at build time
    const musicFiles = import.meta.glob('/public/music/*.mp3', { eager: true, query: '?url', import: 'default' });

    // Store tracks with metadata
    this.allTracks = Object.entries(musicFiles).map(([path, url]) => {
      const filename = path.split('/').pop();
      const name = filename.replace('.mp3', '').replace(/_/g, ' ');
      return { filename, url, name };
    });

    // Initially all tracks are in the playlist
    this.playlist = this.allTracks.map(t => t.url);
    console.log(`Loaded ${this.allTracks.length} music tracks dynamically`);
  }

  // Get all available tracks
  getAllTracks() {
    return this.allTracks;
  }

  // Set favorite tracks - if empty, use all tracks
  setFavorites(favoriteFilenames) {
    this.favorites = favoriteFilenames || [];
    if (this.favorites.length > 0) {
      this.playlist = this.allTracks
        .filter(t => this.favorites.includes(t.filename))
        .map(t => t.url);
    } else {
      // If no favorites, use all tracks
      this.playlist = this.allTracks.map(t => t.url);
    }
    console.log(`Music playlist updated: ${this.playlist.length} tracks`);
  }

  // Preview a specific track
  previewTrack(filename) {
    this.stopPreview();
    const track = this.allTracks.find(t => t.filename === filename);
    if (track) {
      this.previewAudio = new Audio(track.url);
      this.previewAudio.volume = 0.3;
      this.previewAudio.play().catch(() => {});
    }
  }

  // Stop preview
  stopPreview() {
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio = null;
    }
  }

  start() {
    if (this.playlist.length === 0) {
      console.warn('No music playlist loaded');
      return;
    }

    // If already playing, just resume
    if (this.audio && this.isPlaying) {
      this.audio.play().catch(() => {});
      return;
    }

    // Start with random track
    this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    this.isPlaying = true;
    this.playCurrentTrack();
  }

  playCurrentTrack() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    this.audio = new Audio(this.playlist[this.currentIndex]);
    this.audio.volume = this.volume;
    this.audio.loop = false;

    this.audio.addEventListener('ended', () => {
      if (this.isPlaying) {
        this.playNext();
      }
    });

    this.audio.play().catch(e => {
      console.warn('Music autoplay blocked:', e.message);
    });
  }

  playNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.playCurrentTrack();
  }

  stop() {
    this.isPlaying = false;

    if (!this.audio) return;

    const fadeStep = 0.005;
    const fadeInterval = 30;
    const audioRef = this.audio;

    const fadeOut = setInterval(() => {
      if (audioRef && audioRef.volume > fadeStep) {
        audioRef.volume = Math.max(0, audioRef.volume - fadeStep);
      } else {
        clearInterval(fadeOut);
        if (audioRef) {
          audioRef.pause();
        }
        if (this.audio === audioRef) {
          this.audio = null;
        }
      }
    }, fadeInterval);
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume() {
    if (this.audio && this.isPlaying) {
      this.audio.play().catch(() => {});
    }
  }

  forceRestart() {
    // Force restart music from a new track
    this.isPlaying = true;
    this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    this.playCurrentTrack();
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }
}

// Main Audio Manager
class AudioManager {
  constructor() {
    this.soundFX = new SoundFX();
    this.voice = new WorkoutVoice();
    this.music = new BackgroundMusic();
    this.enabled = true;
    this.audioUnlocked = false;
    this.workoutActive = false;

    // Separate audio controls
    this.voiceEnabled = true;
    this.countdownEnabled = true;
    this.musicEnabled = true;
  }

  init(basePath = '') {
    this.music.loadPlaylist(basePath);
    this.setupAudioUnlock();
  }

  setupAudioUnlock() {
    const unlock = () => {
      if (this.audioUnlocked) return;

      // Initialize sound effects
      this.soundFX.init();
      this.soundFX.resume();

      // Try to unlock audio context
      const audio = new Audio();
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
      }).catch(() => {});

      this.audioUnlocked = true;
    };

    // Unlock on first user interaction
    ['click', 'touchstart', 'touchend', 'keydown'].forEach(event => {
      document.addEventListener(event, unlock, { passive: true });
    });
  }

  startWorkout() {
    this.workoutActive = true;
    if (!this.enabled) return;
    this.soundFX.init();
    this.soundFX.resume();
    if (this.musicEnabled) {
      this.music.start();
    }
  }

  onPreparation(exercise, wrongImage = false) {
    if (!this.enabled || !this.voiceEnabled) return;

    // Small delay to let UI update first
    setTimeout(() => {
      if (wrongImage && exercise?.description) {
        // For wrong image exercises, warn and describe
        const text = `Immagine errata, ascoltami. ${exercise.description}`;
        this.voice.speak(text, { rate: 0.85 });
      } else {
        // Just announce the exercise name
        this.voice.speak(exercise.name);
      }
    }, 600);
  }

  onRestStart() {
    if (!this.enabled || !this.voiceEnabled) return;

    const restMessages = [
      "Inspira con il naso ed espira lentamente con la bocca per abbassare il battito cardiaco.",
      "Riposa 30 secondi: dai tempo ai tuoi muscoli di ricaricarsi per la prossima serie.",
      "Fai un respiro profondo, rilassa le spalle e concentrati sul prossimo esercizio.",
      "Muoviti leggermente o cammina per favorire la circolazione e sciogliere i muscoli tra una serie e l'altra.",
      "Se il cuore batte troppo forte, allunga il riposo. Il recupero costruisce la forza."
    ];

    const randomMessage = restMessages[Math.floor(Math.random() * restMessages.length)];

    setTimeout(() => {
      this.voice.speak(randomMessage, { rate: 0.85 });
    }, 500);
  }

  onPrepTick(secondsRemaining) {
    if (!this.enabled) return;
    // Play countdown beeps in the last 3 seconds
    if (secondsRemaining <= 3 && secondsRemaining >= 1 && this.countdownEnabled) {
      this.soundFX.playCountdownBeep(secondsRemaining);
    }
    // Say "GO" at 2 seconds before end of preparation
    if (secondsRemaining === 2 && this.voiceEnabled) {
      this.voice.speakGo();
    }
  }

  onExerciseStart(exercise) {
    if (!this.enabled || !this.voiceEnabled) return;
    // Speak the exercise description when starting
    if (exercise?.description) {
      setTimeout(() => {
        this.voice.speak(exercise.description, { rate: 0.85 });
      }, 800);
    }
  }

  onExerciseTick(secondsRemaining) {
    if (!this.enabled || !this.countdownEnabled) return;
    if (secondsRemaining <= 4 && secondsRemaining >= 1) {
      this.soundFX.playCountdownBeep(secondsRemaining);
    }
  }

  onPause() {
    this.music.pause();
    this.voice.stop();
  }

  onResume() {
    this.music.resume();
  }

  finishWorkout(elapsedTime) {
    this.workoutActive = false;
    this.music.stop();
    this.voice.stop();

    // Say completion message with time
    if (this.enabled && this.voiceEnabled && elapsedTime) {
      setTimeout(() => {
        this.voice.speakCompletion(elapsedTime);
      }, 500);
    }
  }

  exitWorkout() {
    this.workoutActive = false;
    this.music.stop();
    this.voice.stop();

    // Say exit message
    if (this.enabled && this.voiceEnabled) {
      setTimeout(() => {
        this.voice.speakExit();
      }, 300);
    }
  }

  // Master toggle - mutes everything
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.music.stop();
      this.voice.stop();
    } else if (this.workoutActive) {
      // Re-enable during workout: restart music if music is enabled
      this.soundFX.init();
      this.soundFX.resume();
      if (this.musicEnabled) {
        this.music.forceRestart();
      }
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Individual audio controls
  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.voice.stop();
    }
  }

  setCountdownEnabled(enabled) {
    this.countdownEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.music.stop();
    } else if (this.workoutActive && this.enabled) {
      this.music.forceRestart();
    }
  }

  isVoiceEnabled() {
    return this.voiceEnabled;
  }

  isCountdownEnabled() {
    return this.countdownEnabled;
  }

  isMusicEnabled() {
    return this.musicEnabled;
  }

  setMusicVolume(volume) {
    this.music.setVolume(volume);
  }

  // Voice selection
  getAvailableVoices() {
    return this.voice.getAvailableVoices();
  }

  setSelectedVoice(voiceName) {
    return this.voice.setVoice(voiceName);
  }

  getCurrentVoiceName() {
    return this.voice.getCurrentVoiceName();
  }

  // Music track management
  getAllMusicTracks() {
    return this.music.getAllTracks();
  }

  setMusicFavorites(favoriteFilenames) {
    this.music.setFavorites(favoriteFilenames);
  }

  previewMusicTrack(filename) {
    this.music.previewTrack(filename);
  }

  stopMusicPreview() {
    this.music.stopPreview();
  }
}

// Export singleton instance
const audioManager = new AudioManager();
export default audioManager;
