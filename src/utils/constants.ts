// Audio letters - chosen for distinctiveness
export const AUDIO_LETTERS = ['C', 'H', 'K', 'L', 'Q', 'R', 'S', 'T'] as const;

// Grid positions (0-8 for 3x3 grid)
export const GRID_SIZE = 9;
export const GRID_COLS = 3;
export const GRID_ROWS = 3;

// N-back range
export const MIN_N_LEVEL = 1;
export const MAX_N_LEVEL = 6;

// Timing (in milliseconds)
export const TRIAL_INTERVAL_MS = 3000;
export const STIMULUS_DURATION_MS = 500;
export const RESPONSE_WINDOW_MS = 2900;
export const DEBOUNCE_MS = 100;
export const MIN_REACTION_TIME_MS = 100;  // Below this is anticipation

// UI timing constants
export const INPUT_FLASH_DURATION_MS = 150;
export const TRIAL_FEEDBACK_DELAY_MS = 200;
export const VOICE_LOADING_TIMEOUT_MS = 2000;

// Session recovery
export const SESSION_RECOVERY_TIMEOUT_MS = 5 * 60 * 1000;  // 5 minutes

// Sequence generation
export const TARGET_POSITION_MATCH_RATE = 0.25;
export const TARGET_AUDIO_MATCH_RATE = 0.25;
export const MIN_POSITION_MATCHES = 4;
export const MIN_AUDIO_MATCHES = 4;

// Adaptive difficulty thresholds
export const LEVEL_UP_THRESHOLD = 80;      // Combined accuracy >= 80%
export const LEVEL_UP_MIN_INDIVIDUAL = 75; // Each type >= 75%
export const LEVEL_DOWN_THRESHOLD = 50;    // Combined accuracy < 50%
export const LEVEL_DOWN_MIN_INDIVIDUAL = 40; // Either type < 40%

// Storage limits
export const MAX_SESSIONS_STORED = 365;
export const MAX_STORAGE_BYTES = 4 * 1024 * 1024;  // 4MB
export const TARGET_STORAGE_BYTES = 3.5 * 1024 * 1024;  // 3.5MB cleanup target
export const DETAILED_TRIAL_RETENTION = 30;  // Keep trial data for last 30 sessions

// Default settings
export const DEFAULT_SETTINGS = {
  defaultNLevel: 2,
  adaptiveMode: true,
  adaptiveNLevel: 2,
  soundEffectsEnabled: true,
  reminderEnabled: false,
  reminderTime: '09:00',
  reminderDays: [1, 2, 3, 4, 5],  // Mon-Fri
  hasCompletedOnboarding: false,
} as const;

// Keyboard keys
export const KEYS = {
  POSITION: ['a', 'A'],
  AUDIO: ['f', 'F'],
  START_PAUSE: [' '],
  ESCAPE: ['Escape'],
} as const;

// Calculate trials per session: 20 + N
export function getTrialsPerSession(nLevel: number): number {
  return 20 + nLevel;
}
