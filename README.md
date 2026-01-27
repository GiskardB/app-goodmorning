# Good Morning Fitness - 28 Days Calisthenics PWA

A Progressive Web Application for a 28-day bodyweight fitness program. The app guides users through daily workouts with animated GIF demonstrations, voice coaching, and background music.

## Features

- **28-Day Program**: Structured daily workouts targeting different muscle groups
- **Three-Phase Workouts**: Each session includes warmup, main workout, and cooldown
- **Animated Exercises**: GIF and video (MP4/WebM) demonstrations for each exercise
- **Voice Coaching**: Italian text-to-speech announces exercises and provides rest tips
- **Background Music**: Motivational workout music playlist
- **Audio Countdown**: Beep sounds for exercise transitions
- **Progress Tracking**: IndexedDB persistence for completed days and workout history
- **Mid-Workout Rest**: 30-second rest pause in the middle of main workout
- **PWA Support**: Installable on mobile devices, works offline
- **Wake Lock**: Screen stays on during workouts
- **Responsive Design**: Optimized for mobile devices

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **IndexedDB (idb)** - Local data persistence
- **Web Audio API** - Sound effects
- **Web Speech API** - Voice synthesis
- **Screen Wake Lock API** - Prevents screen timeout
- **Vite PWA Plugin** - Service worker and manifest generation

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
# Clone the repository
git clone https://github.com/giskardb/app-goodmorning.git

# Navigate to project directory
cd app-goodmorning

# Install dependencies
npm install
```

## Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment

The project includes a GitHub Actions workflow for automatic deployment to GitHub Pages. On every push to `main`, the app is built and deployed to:

```
https://<username>.github.io/app-goodmorning/
```

### Manual GitHub Pages Setup

1. Go to repository Settings → Pages
2. Under "Build and deployment", select **GitHub Actions** as source
3. Push to main branch to trigger deployment

## Project Structure

```
├── public/
│   ├── assets/          # Exercise GIF animations
│   ├── music/           # Background music tracks
│   ├── exercises.json   # Exercise definitions
│   ├── workouts.json    # 28-day workout program
│   └── warmup_cooldown.json  # Warmup/cooldown routines
├── src/
│   ├── audio/
│   │   └── AudioManager.js   # Sound, music, and voice management
│   ├── db/
│   │   └── index.js          # IndexedDB operations
│   ├── App.jsx               # Main application component
│   └── index.css             # Global styles and design system
├── vite.config.js            # Vite and PWA configuration
└── package.json
```

## Configuration

The `vite.config.js` uses dynamic base path:
- Development: `/` (root)
- Production: `/app-goodmorning/` (for GitHub Pages)

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- iOS Safari 13.4+

**Note**: Some features have limited support on iOS:
- PWA install prompt not available (use Safari's "Add to Home Screen")
- Wake Lock API may not work on all iOS versions

## License

MIT

## Credits

- Exercise GIFs from open-source fitness resources
- Background music from [FreeToUse](https://freetouse.com)
