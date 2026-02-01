import type { Trial } from '../types/game';
import {
  AUDIO_LETTERS,
  GRID_SIZE,
  TARGET_POSITION_MATCH_RATE,
  TARGET_AUDIO_MATCH_RATE,
  MIN_POSITION_MATCHES,
  MIN_AUDIO_MATCHES,
  getTrialsPerSession,
} from './constants';

/**
 * Generate a random integer between 0 and max (exclusive)
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Generate a random position (0-8)
 */
function randomPosition(): number {
  return randomInt(GRID_SIZE);
}

/**
 * Generate a random letter from the audio set
 */
function randomLetter(): string {
  return AUDIO_LETTERS[randomInt(AUDIO_LETTERS.length)];
}

/**
 * Generate the trial sequence for a session
 *
 * Algorithm:
 * 1. Generate random base sequence
 * 2. Mark first N trials as warmup (no matches possible)
 * 3. Inject position matches to hit target rate
 * 4. Inject audio matches to hit target rate
 * 5. Ensure minimum match counts
 */
export function generateSequence(nLevel: number): Trial[] {
  const totalTrials = getTrialsPerSession(nLevel);
  const trials: Trial[] = [];

  // Phase 1: Generate random base sequence
  for (let i = 0; i < totalTrials; i++) {
    trials.push({
      index: i,
      position: randomPosition(),
      letter: randomLetter(),
      isWarmup: i < nLevel,  // First N trials are warmup
      positionMatch: false,
      audioMatch: false,
    });
  }

  // Phase 2: Calculate target match counts for scored trials
  const scoredTrialCount = totalTrials - nLevel;
  const targetPositionMatches = Math.max(
    MIN_POSITION_MATCHES,
    Math.round(scoredTrialCount * TARGET_POSITION_MATCH_RATE)
  );
  const targetAudioMatches = Math.max(
    MIN_AUDIO_MATCHES,
    Math.round(scoredTrialCount * TARGET_AUDIO_MATCH_RATE)
  );

  // Phase 3: Inject position matches
  let positionMatchCount = 0;
  const scoredIndices = trials
    .filter(t => !t.isWarmup)
    .map(t => t.index);

  // Shuffle indices for random match placement
  const shuffledPositionIndices = [...scoredIndices].sort(() => Math.random() - 0.5);

  for (const idx of shuffledPositionIndices) {
    if (positionMatchCount >= targetPositionMatches) break;

    const nBackIdx = idx - nLevel;
    if (nBackIdx >= 0) {
      // Set this trial's position to match n-back
      trials[idx].position = trials[nBackIdx].position;
      trials[idx].positionMatch = true;
      positionMatchCount++;
    }
  }

  // Phase 4: Inject audio matches
  let audioMatchCount = 0;
  const shuffledAudioIndices = [...scoredIndices].sort(() => Math.random() - 0.5);

  for (const idx of shuffledAudioIndices) {
    if (audioMatchCount >= targetAudioMatches) break;

    const nBackIdx = idx - nLevel;
    if (nBackIdx >= 0) {
      // Set this trial's letter to match n-back
      trials[idx].letter = trials[nBackIdx].letter;
      trials[idx].audioMatch = true;
      audioMatchCount++;
    }
  }

  // Phase 5: Verify and recalculate actual matches
  // (Some injected matches might have been overwritten)
  for (let i = nLevel; i < totalTrials; i++) {
    const nBackIdx = i - nLevel;
    trials[i].positionMatch = trials[i].position === trials[nBackIdx].position;
    trials[i].audioMatch = trials[i].letter === trials[nBackIdx].letter;
  }

  return trials;
}

/**
 * Get match statistics for a sequence (for debugging/testing)
 */
export function getSequenceStats(trials: Trial[]): {
  totalTrials: number;
  scoredTrials: number;
  positionMatches: number;
  audioMatches: number;
  dualMatches: number;
} {
  const scoredTrials = trials.filter(t => !t.isWarmup);
  const positionMatches = scoredTrials.filter(t => t.positionMatch).length;
  const audioMatches = scoredTrials.filter(t => t.audioMatch).length;
  const dualMatches = scoredTrials.filter(t => t.positionMatch && t.audioMatch).length;

  return {
    totalTrials: trials.length,
    scoredTrials: scoredTrials.length,
    positionMatches,
    audioMatches,
    dualMatches,
  };
}
