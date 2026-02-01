// Trial outcome types
export type TrialOutcome = 'hit' | 'miss' | 'falseAlarm' | 'correctRejection';

// Single trial in a sequence
export interface Trial {
  index: number;
  position: number;           // 0-8 grid position
  letter: string;             // Audio letter
  isWarmup: boolean;          // First N trials
  positionMatch: boolean;     // Is this a position match?
  audioMatch: boolean;        // Is this an audio match?
}

// User's response to a trial
export interface TrialResponse {
  trialIndex: number;
  userPositionResponse: boolean;    // Did user press A?
  userAudioResponse: boolean;       // Did user press F?
  positionReactionTime: number | null;  // ms from stimulus, null if no response
  audioReactionTime: number | null;
  positionOutcome: TrialOutcome | null; // null for warmup
  audioOutcome: TrialOutcome | null;
}

// Game session state
export interface GameState {
  status: 'idle' | 'warmup' | 'playing' | 'paused' | 'finished';
  nLevel: number;
  currentTrialIndex: number;
  sequence: Trial[];
  responses: TrialResponse[];
  sessionId: string;
  startedAt: number | null;
  stimulusOnsetTime: number | null;
}

// Completed session record
export interface Session {
  id: string;
  timestamp: number;
  nLevel: number;
  totalTrials: number;
  scoredTrials: number;

  // Position metrics
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  positionCorrectRejections: number;
  positionAccuracy: number;

  // Audio metrics
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  audioCorrectRejections: number;
  audioAccuracy: number;

  combinedAccuracy: number;
  avgReactionTime: number;
  adaptiveEnabled: boolean;
  completed: boolean;
}

// Interrupted session for recovery
export interface InterruptedSession {
  sessionId: string;
  nLevel: number;
  currentTrialIndex: number;
  sequence: Trial[];
  responses: TrialResponse[];
  startedAt: number;
  interruptedAt: number;
}

// User settings
export interface Settings {
  defaultNLevel: number;
  adaptiveMode: boolean;
  adaptiveNLevel: number;
  soundEffectsEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string;          // HH:MM
  reminderDays: number[];        // 0-6, Sunday = 0
  hasCompletedOnboarding: boolean;
}

// Audio state
export interface AudioState {
  available: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  errorMessage: string | null;
}

// Keyboard input config
export interface InputConfig {
  responseWindowMs: number;
  debounceMs: number;
}
