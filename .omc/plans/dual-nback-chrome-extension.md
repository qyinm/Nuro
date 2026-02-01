# Dual N-Back Chrome Extension - Work Plan

## Project Overview

A minimal, black-and-white Chrome extension for Dual N-Back cognitive training with comprehensive stats tracking.

### Core Specifications

| Aspect | Decision |
|--------|----------|
| **Framework** | WXT + Vue.js + TypeScript |
| **UI Mode** | Popup with session recovery |
| **Design** | Soft minimal - dark grays, off-whites, subtle shadows, rounded corners |
| **Grid** | 3x3 (9 positions) |
| **N-back Range** | 1-back to 6-back |
| **Stimuli** | Position (visual grid) + Audio (spoken letters) |
| **Audio Letters** | C, H, K, L, Q, R, S, T (8 letters) |
| **Audio Engine** | Web Speech API with error handling |
| **Trials per Session** | 20 + N (e.g., 25 trials for 5-back) |
| **Trial Interval** | Fixed 3 seconds |
| **Input** | Keyboard only (A = position match, F = audio match) |
| **Difficulty** | Manual + Adaptive (user toggle) |
| **Stats** | Comprehensive dashboard with custom SVG charts |
| **Extras** | Sound effects, daily reminder notifications |

---

## Critical Design Decisions (Addressing Review Feedback)

### 1. Popup Focus Loss Handling

**Problem:** Chrome popups close when focus is lost, potentially mid-game.

**Solution:**
- Persist game state to `chrome.storage.local` on every trial
- On popup open, check for incomplete session
- Show "Resume Session?" dialog if interrupted session found
- Store: current trial index, sequence, responses so far, elapsed time

```typescript
interface InterruptedSession {
  sessionId: string;
  nLevel: number;
  currentTrialIndex: number;
  sequence: Trial[];
  responses: TrialResponse[];
  startedAt: number;
  interruptedAt: number;
}
```

### 2. Web Speech API Error Handling

**Problem:** TTS may fail silently or have no voices available.

**Solution:**
- On extension load, detect available voices via `speechSynthesis.getVoices()`
- If no voices: show warning banner, disable audio stimulus, offer position-only mode
- Wrap all `speechSynthesis.speak()` in try-catch
- Add `onerror` handler to `SpeechSynthesisUtterance`
- Pre-warm TTS on popup open (speak empty string) to reduce first-call latency

```typescript
interface AudioState {
  available: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  errorMessage: string | null;
}
```

### 3. Keyboard Input Handling

**Problem:** Focus management, debouncing, and multi-key scenarios undefined.

**Solution:**
- Auto-focus popup container on open via `document.body.focus()`
- Response window: 0ms to 2900ms after stimulus onset
- Debounce: Ignore duplicate key within 100ms
- Multi-key: Both A and F can be pressed in same trial (dual match)
- Early press (before stimulus): Ignored
- Prevent default for Space key to avoid scroll

```typescript
interface InputConfig {
  responseWindowMs: 2900;
  debounceMs: 100;
  keys: {
    position: 'a' | 'A';
    audio: 'f' | 'F';
    startPause: ' ';
    escape: 'Escape';
  };
}
```

### 4. Sequence Generation Algorithm

**Problem:** Match probability and distribution not specified.

**Solution:**
- Target match rates: ~25% position, ~25% audio, ~6% dual (both match)
- Minimum guarantees per session: 4 position matches, 4 audio matches
- First N trials: Warm-up period, no valid matches possible, no input accepted
- Algorithm: Generate random sequence, then inject matches to hit targets

```typescript
interface SequenceConfig {
  positionMatchRate: 0.25;
  audioMatchRate: 0.25;
  dualMatchRate: 0.06;
  minPositionMatches: 4;
  minAudioMatches: 4;
}
```

### 5. Complete Scoring System

**Problem:** Only hits/misses/false alarms mentioned, missing correct rejections.

**Solution:**
All four outcomes tracked per stimulus type:

| Outcome | Definition |
|---------|------------|
| **Hit** | Match present, user responded |
| **Miss** | Match present, user didn't respond |
| **False Alarm** | No match, user responded |
| **Correct Rejection** | No match, user didn't respond |

```typescript
// Accuracy formula
accuracy = (hits + correctRejections) / totalScoredTrials * 100

// D-prime (sensitivity) - optional advanced metric
dPrime = Z(hitRate) - Z(falseAlarmRate)
```

### 6. Reaction Time Measurement

**Problem:** Timing boundaries unclear.

**Solution:**
- Timer starts: At stimulus onset (grid highlight + audio start)
- Timer ends: At `keydown` event
- Valid range: 100ms to 2900ms (ignore <100ms as anticipation)
- No response: `null` reaction time, not counted in average

### 7. Storage Quota Management

**Problem:** 5MB limit with no retention policy.

**Solution:**
- Retain last 365 sessions (est. 1MB)
- On save, check storage usage via `chrome.storage.local.getBytesInUse()`
- If >4MB: Delete oldest sessions until under 3.5MB
- Individual trial data: Only keep for last 30 sessions (for detailed replay)

---

## Architecture

```
recall-nback/
├── src/
│   ├── entrypoints/
│   │   ├── popup/
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   └── background.ts
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameBoard.vue
│   │   │   ├── GameControls.vue
│   │   │   ├── TrialFeedback.vue
│   │   │   ├── GameTimer.vue
│   │   │   ├── WarmupIndicator.vue    # NEW: Shows "Get ready..." for first N trials
│   │   │   └── ResumeDialog.vue       # NEW: Resume interrupted session
│   │   ├── stats/
│   │   │   ├── StatsOverview.vue
│   │   │   ├── TrendChart.vue         # RENAMED: Custom SVG chart
│   │   │   ├── SessionHistory.vue
│   │   │   ├── AccuracyByLevel.vue
│   │   │   └── EmptyState.vue         # NEW: No sessions yet
│   │   ├── settings/
│   │   │   ├── SettingsPanel.vue
│   │   │   └── ReminderConfig.vue
│   │   ├── ui/
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   ├── Toggle.vue
│   │   │   └── Banner.vue             # NEW: Warning banners
│   │   └── onboarding/
│   │       └── Tutorial.vue           # NEW: First-time user guide
│   ├── composables/
│   │   ├── useGame.ts
│   │   ├── useAudio.ts
│   │   ├── useStats.ts
│   │   ├── useStorage.ts
│   │   ├── useNotifications.ts
│   │   ├── useKeyboard.ts             # NEW: Dedicated keyboard handling
│   │   └── useSessionRecovery.ts      # NEW: Interrupted session handling
│   ├── stores/
│   │   ├── gameStore.ts
│   │   └── statsStore.ts
│   ├── utils/
│   │   ├── gameEngine.ts
│   │   ├── sequenceGenerator.ts
│   │   ├── scoring.ts
│   │   ├── constants.ts
│   │   ├── svgCharts.ts               # NEW: Custom SVG chart utilities
│   │   └── storageCleanup.ts          # NEW: Quota management
│   └── types/
│       ├── game.ts
│       └── stats.ts
├── assets/
│   └── sounds/
│       ├── correct.mp3
│       ├── incorrect.mp3
│       └── session-complete.mp3
├── public/
│   └── icon/
│       ├── 16.png
│       ├── 32.png
│       ├── 48.png
│       └── 128.png
├── wxt.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Task Breakdown

### Phase 1: Project Setup
- [ ] **1.1** Initialize WXT project with Vue.js + TypeScript template
- [ ] **1.2** Configure Tailwind CSS with black & white color palette
- [ ] **1.3** Set up Pinia for state management
- [ ] **1.4** Create base UI components (Button, Card, Toggle, Banner)
- [ ] **1.5** Configure Chrome extension manifest with required permissions

### Phase 2: Core Game Engine
- [ ] **2.1** Design stats data model and storage schema (moved from Phase 4)
- [ ] **2.2** Implement sequence generator with match probability control
  - 25% position match rate, 25% audio match rate
  - Minimum 4 matches per type per session
  - First N trials marked as warm-up (no valid matches)
- [ ] **2.3** Create game engine with n-back matching logic
- [ ] **2.4** Implement complete scoring system
  - Track hits, misses, false alarms, correct rejections
  - Calculate accuracy: (hits + correctRejections) / total
  - Track reaction times (100ms-2900ms valid range)
- [ ] **2.5** Build useGame composable for game state management
- [ ] **2.6** Create useAudio composable with Web Speech API
  - Voice availability detection on load
  - Error handling with onerror callback
  - Pre-warm TTS on popup open
  - Fallback to position-only mode if no voices

### Phase 3: Game UI
- [ ] **3.1** Build GameBoard component (3x3 grid with animations)
- [ ] **3.2** Create GameControls (N-level selector, start/stop, pause)
- [ ] **3.3** Implement useKeyboard composable
  - Auto-focus on popup open
  - 2900ms response window
  - 100ms debounce
  - Handle simultaneous A+F (dual match response)
  - Prevent default on Space key
- [ ] **3.4** Add TrialFeedback component (correct/incorrect visual feedback)
- [ ] **3.5** Create WarmupIndicator ("Get ready... 3, 2, 1")
- [ ] **3.6** Create game timer/progress indicator
- [ ] **3.7** Integrate sound effects for feedback

### Phase 4: Session Recovery & Storage
- [ ] **4.1** Implement useSessionRecovery composable
  - Save state on every trial to chrome.storage.local
  - Detect interrupted session on popup open
  - Calculate if session is resumable (<5 min old)
- [ ] **4.2** Create ResumeDialog component
- [ ] **4.3** Implement useStorage composable for Chrome storage
- [ ] **4.4** Add storage quota management
  - Monitor usage with getBytesInUse()
  - Retain 365 sessions, prune if >4MB
  - Keep detailed trial data for last 30 sessions only

### Phase 5: Stats Dashboard
- [ ] **5.1** Build StatsOverview with summary cards
  - Total sessions, average accuracy, current streak
  - Best N-level achieved, total training time
- [ ] **5.2** Create custom SVG TrendChart component
  - Line chart for accuracy over time
  - Lightweight, no external dependencies
- [ ] **5.3** Build SessionHistory component with pagination
- [ ] **5.4** Implement AccuracyByLevel breakdown (bar chart SVG)
- [ ] **5.5** Add reaction time stats display
- [ ] **5.6** Create EmptyState component for new users

### Phase 6: Settings & Adaptive Mode
- [ ] **6.1** Create SettingsPanel with configuration options
  - Sound effects toggle
  - Default N-level
  - Adaptive mode toggle
- [ ] **6.2** Implement adaptive difficulty algorithm
  - >=80% combined AND >=75% each → level up
  - <50% combined OR <40% either → level down
- [ ] **6.3** Persist settings to Chrome storage
- [ ] **6.4** New user defaults: N=2, adaptive=true

### Phase 7: Notifications
- [ ] **7.1** Set up background service worker
- [ ] **7.2** Implement Chrome alarms API for scheduling
- [ ] **7.3** Create ReminderConfig UI
- [ ] **7.4** Handle notification permission
  - Request on first enable
  - Graceful denial: disable reminder UI, show explanation
- [ ] **7.5** Add notification click handling (open popup)

### Phase 8: Polish & Testing
- [ ] **8.1** Refine animations and transitions
- [ ] **8.2** Ensure popup sizing works across resolutions (360x540px)
- [ ] **8.3** Test keyboard accessibility thoroughly
- [ ] **8.4** Create Tutorial component for first-time users
  - Single page with diagram
  - 3 practice trials option
- [ ] **8.5** Add loading states throughout
- [ ] **8.6** Performance optimization and bundle size check (<300KB target)
- [ ] **8.7** Cross-browser testing (Chrome, Edge)
- [ ] **8.8** Add aria-labels for screen reader navigation

---

## Design Specifications

### Color Palette (Soft Minimal B&W)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #2e2e2e;

  /* Text */
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --text-tertiary: #666666;

  /* Accents */
  --accent-light: #ffffff;
  --accent-subtle: #404040;

  /* Feedback (only color exceptions) */
  --correct: #4ade80;
  --incorrect: #f87171;
  --warning: #fbbf24;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
}
```

### Typography

- **Font**: Inter or system-ui
- **Sizes**: 12px (small), 14px (body), 18px (headings), 24px (large numbers)
- **Weight**: 400 (normal), 500 (medium), 600 (semibold)

### Component Styling

- **Border radius**: 8px (cards), 6px (buttons), 4px (inputs)
- **Spacing**: 8px base unit
- **Grid cells**: 48x48px with 4px gap
- **Popup size**: 360px width × 540px height

### Animations

- **Grid highlight**: 200ms ease-out scale + opacity
- **Feedback flash**: 150ms pulse
- **Page transitions**: 200ms fade
- **Button hover**: 100ms background transition

---

## Data Models

### Session Record
```typescript
interface Session {
  id: string;
  timestamp: number;
  nLevel: number;
  totalTrials: number;
  scoredTrials: number;           // Excludes warm-up trials

  // Position metrics
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  positionCorrectRejections: number;
  positionAccuracy: number;       // 0-100

  // Audio metrics
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  audioCorrectRejections: number;
  audioAccuracy: number;          // 0-100

  combinedAccuracy: number;       // 0-100
  avgReactionTime: number;        // milliseconds
  adaptiveEnabled: boolean;
  completed: boolean;
}
```

### Trial Record
```typescript
interface Trial {
  index: number;
  position: number;               // 0-8 grid position
  letter: string;                 // Audio letter
  isWarmup: boolean;              // First N trials
  positionMatch: boolean;
  audioMatch: boolean;
  userPositionResponse: boolean | null;
  userAudioResponse: boolean | null;
  positionReactionTime: number | null;  // null if no response
  audioReactionTime: number | null;
  positionOutcome: 'hit' | 'miss' | 'falseAlarm' | 'correctRejection' | null;
  audioOutcome: 'hit' | 'miss' | 'falseAlarm' | 'correctRejection' | null;
}
```

### User Settings
```typescript
interface Settings {
  defaultNLevel: number;
  adaptiveMode: boolean;
  adaptiveNLevel: number;         // Persisted adaptive level
  soundEffectsEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string;           // HH:MM
  reminderDays: number[];         // 0-6
  hasCompletedOnboarding: boolean;
}
```

### Interrupted Session
```typescript
interface InterruptedSession {
  sessionId: string;
  nLevel: number;
  currentTrialIndex: number;
  sequence: Trial[];
  responses: TrialResponse[];
  startedAt: number;
  interruptedAt: number;
}
```

---

## Adaptive Difficulty Algorithm

```
After each completed session:
  position_accuracy = (positionHits + positionCorrectRejections) / scoredTrials
  audio_accuracy = (audioHits + audioCorrectRejections) / scoredTrials
  combined_accuracy = (position_accuracy + audio_accuracy) / 2

  if combined_accuracy >= 80% AND position_accuracy >= 75% AND audio_accuracy >= 75%:
    n_level = min(n_level + 1, 6)

  else if combined_accuracy < 50% OR position_accuracy < 40% OR audio_accuracy < 40%:
    n_level = max(n_level - 1, 1)

  else:
    n_level stays same

  Persist n_level to settings.adaptiveNLevel
```

---

## Keyboard Controls

| Key | Action | Context |
|-----|--------|---------|
| `A` | Position match response | During scored trials only |
| `F` | Audio match response | During scored trials only |
| `Space` | Start/Pause game | Menu or during game |
| `Escape` | Return to menu | During game |

**Input Rules:**
- Ignored during warm-up trials
- 100ms debounce per key
- Both A+F can be pressed in same trial
- Response window: 0-2900ms after stimulus

---

## Permissions Required

```json
{
  "permissions": [
    "storage",
    "alarms",
    "notifications"
  ]
}
```

---

## Success Criteria

1. ✅ Popup opens within 200ms
2. ✅ Audio plays via Web Speech API (with graceful fallback if unavailable)
3. ✅ Keyboard responses register within 50ms
4. ✅ Stats persist across browser sessions
5. ✅ Interrupted sessions can be resumed within 5 minutes
6. ✅ Adaptive difficulty adjusts correctly based on formula
7. ✅ Daily reminders trigger at configured time
8. ✅ Works on Chrome 120+ and Edge 120+
9. ✅ Extension size < 300KB (reduced from 500KB)
10. ✅ Storage stays under 4MB with automatic cleanup

---

## Dependencies

```json
{
  "dependencies": {
    "vue": "^3.4",
    "pinia": "^2.1"
  },
  "devDependencies": {
    "wxt": "^0.19",
    "@wxt-dev/module-vue": "^1.0",
    "typescript": "^5.3",
    "tailwindcss": "^3.4",
    "autoprefixer": "^10.4"
  }
}
```

**Note:** Chart.js removed in favor of custom SVG charts for smaller bundle size.

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Web Speech API fails | Detect on load, show warning, offer position-only mode |
| Popup closes mid-game | Auto-save state, resume dialog on reopen |
| Storage quota exceeded | Auto-prune old sessions, monitor usage |
| Notification permission denied | Graceful degradation, explain in UI |
| No voices on system | Clear error message, position-only fallback |

---

## Out of Scope (v1)

- Cloud sync across devices
- Leaderboards / social features
- Custom audio files
- Side panel mode
- Export/import data
- Multiple user profiles

---

*Plan created: 2026-02-01*
*Plan revised: 2026-02-01 (addressed Critic review)*
*Status: Ready for implementation*
*Total tasks: 43*
