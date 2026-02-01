import type { Trial, TrialResponse, TrialOutcome, Session } from '../types/game';
import {
  LEVEL_UP_THRESHOLD,
  LEVEL_UP_MIN_INDIVIDUAL,
  LEVEL_DOWN_THRESHOLD,
  LEVEL_DOWN_MIN_INDIVIDUAL,
  MIN_N_LEVEL,
  MAX_N_LEVEL
} from './constants';

/**
 * Determine the outcome of a single stimulus response
 */
export function getOutcome(
  isMatch: boolean,
  userResponded: boolean
): TrialOutcome {
  if (isMatch && userResponded) return 'hit';
  if (isMatch && !userResponded) return 'miss';
  if (!isMatch && userResponded) return 'falseAlarm';
  return 'correctRejection';
}

/**
 * Calculate accuracy from outcomes
 * Accuracy = (hits + correctRejections) / total
 */
export function calculateAccuracy(
  hits: number,
  misses: number,
  falseAlarms: number,
  correctRejections: number
): number {
  const total = hits + misses + falseAlarms + correctRejections;
  if (total === 0) return 0;
  return Math.round(((hits + correctRejections) / total) * 100);
}

/**
 * Calculate average reaction time from valid responses
 */
export function calculateAvgReactionTime(
  reactionTimes: (number | null)[]
): number {
  const validTimes = reactionTimes.filter((t): t is number => t !== null && t >= 100);
  if (validTimes.length === 0) return 0;
  return Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
}

/**
 * Generate a complete session record from trials and responses
 */
export function generateSessionRecord(
  sessionId: string,
  nLevel: number,
  trials: Trial[],
  responses: TrialResponse[],
  adaptiveEnabled: boolean,
  completed: boolean,
  startedAt: number
): Session {
  // Filter out warmup trials
  const scoredTrials = trials.filter(t => !t.isWarmup);
  const scoredResponses = responses.filter(r => {
    const trial = trials.find(t => t.index === r.trialIndex);
    return trial && !trial.isWarmup;
  });

  // Count position outcomes
  let positionHits = 0;
  let positionMisses = 0;
  let positionFalseAlarms = 0;
  let positionCorrectRejections = 0;

  // Count audio outcomes
  let audioHits = 0;
  let audioMisses = 0;
  let audioFalseAlarms = 0;
  let audioCorrectRejections = 0;

  // Collect reaction times
  const positionReactionTimes: (number | null)[] = [];
  const audioReactionTimes: (number | null)[] = [];

  for (const response of scoredResponses) {
    // Position outcomes
    switch (response.positionOutcome) {
      case 'hit': positionHits++; break;
      case 'miss': positionMisses++; break;
      case 'falseAlarm': positionFalseAlarms++; break;
      case 'correctRejection': positionCorrectRejections++; break;
    }

    // Audio outcomes
    switch (response.audioOutcome) {
      case 'hit': audioHits++; break;
      case 'miss': audioMisses++; break;
      case 'falseAlarm': audioFalseAlarms++; break;
      case 'correctRejection': audioCorrectRejections++; break;
    }

    positionReactionTimes.push(response.positionReactionTime);
    audioReactionTimes.push(response.audioReactionTime);
  }

  const positionAccuracy = calculateAccuracy(
    positionHits, positionMisses, positionFalseAlarms, positionCorrectRejections
  );
  const audioAccuracy = calculateAccuracy(
    audioHits, audioMisses, audioFalseAlarms, audioCorrectRejections
  );
  const combinedAccuracy = Math.round((positionAccuracy + audioAccuracy) / 2);

  const allReactionTimes = [...positionReactionTimes, ...audioReactionTimes];
  const avgReactionTime = calculateAvgReactionTime(allReactionTimes);

  return {
    id: sessionId,
    timestamp: startedAt,
    nLevel,
    totalTrials: trials.length,
    scoredTrials: scoredTrials.length,
    positionHits,
    positionMisses,
    positionFalseAlarms,
    positionCorrectRejections,
    positionAccuracy,
    audioHits,
    audioMisses,
    audioFalseAlarms,
    audioCorrectRejections,
    audioAccuracy,
    combinedAccuracy,
    avgReactionTime,
    adaptiveEnabled,
    completed,
  };
}

/**
 * Determine new N-level based on adaptive algorithm
 */
export function calculateAdaptiveLevel(
  currentLevel: number,
  positionAccuracy: number,
  audioAccuracy: number,
  combinedAccuracy: number
): number {
  // Level up condition
  if (
    combinedAccuracy >= LEVEL_UP_THRESHOLD &&
    positionAccuracy >= LEVEL_UP_MIN_INDIVIDUAL &&
    audioAccuracy >= LEVEL_UP_MIN_INDIVIDUAL
  ) {
    return Math.min(currentLevel + 1, MAX_N_LEVEL);
  }

  // Level down condition
  if (
    combinedAccuracy < LEVEL_DOWN_THRESHOLD ||
    positionAccuracy < LEVEL_DOWN_MIN_INDIVIDUAL ||
    audioAccuracy < LEVEL_DOWN_MIN_INDIVIDUAL
  ) {
    return Math.max(currentLevel - 1, MIN_N_LEVEL);
  }

  // Stay same
  return currentLevel;
}
