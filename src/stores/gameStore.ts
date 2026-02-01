import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GameState, Trial, TrialResponse, Session } from '../types/game';
import { generateSequence } from '../utils/sequenceGenerator';
import { generateSessionRecord, getOutcome, calculateAdaptiveLevel } from '../utils/scoring';
import { DEFAULT_SETTINGS, MIN_N_LEVEL, MAX_N_LEVEL } from '../utils/constants';

export const useGameStore = defineStore('game', () => {
  // Game state
  const status = ref<GameState['status']>('idle');
  const nLevel = ref(DEFAULT_SETTINGS.defaultNLevel);
  const currentTrialIndex = ref(0);
  const sequence = ref<Trial[]>([]);
  const responses = ref<TrialResponse[]>([]);
  const sessionId = ref('');
  const startedAt = ref<number | null>(null);
  const stimulusOnsetTime = ref<number | null>(null);

  // Settings
  const adaptiveMode = ref(DEFAULT_SETTINGS.adaptiveMode);
  const adaptiveNLevel = ref(DEFAULT_SETTINGS.adaptiveNLevel);
  const soundEffectsEnabled = ref(DEFAULT_SETTINGS.soundEffectsEnabled);

  // Computed
  const currentTrial = computed(() => {
    if (currentTrialIndex.value >= sequence.value.length) return null;
    return sequence.value[currentTrialIndex.value];
  });

  const isWarmup = computed(() => {
    return currentTrial.value?.isWarmup ?? false;
  });

  const progress = computed(() => {
    if (sequence.value.length === 0) return 0;
    return Math.round((currentTrialIndex.value / sequence.value.length) * 100);
  });

  const trialsRemaining = computed(() => {
    return sequence.value.length - currentTrialIndex.value;
  });

  // Actions
  function startSession(level?: number) {
    const useLevel = level ?? (adaptiveMode.value ? adaptiveNLevel.value : nLevel.value);

    sessionId.value = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    nLevel.value = useLevel;
    sequence.value = generateSequence(useLevel);
    responses.value = [];
    currentTrialIndex.value = 0;
    startedAt.value = Date.now();
    stimulusOnsetTime.value = null;
    status.value = 'warmup';
  }

  function setStimulus() {
    stimulusOnsetTime.value = performance.now();
    if (isWarmup.value) {
      status.value = 'warmup';
    } else {
      status.value = 'playing';
    }
  }

  function recordResponse(positionPressed: boolean, audioPressed: boolean) {
    if (!currentTrial.value || currentTrial.value.isWarmup) return;
    if (stimulusOnsetTime.value === null) return;

    const now = performance.now();
    const reactionTime = now - stimulusOnsetTime.value;

    // Check if we already have a response for this trial
    const existingIdx = responses.value.findIndex(r => r.trialIndex === currentTrialIndex.value);

    if (existingIdx >= 0) {
      // Update existing response
      const existing = responses.value[existingIdx];
      if (positionPressed && !existing.userPositionResponse) {
        existing.userPositionResponse = true;
        existing.positionReactionTime = reactionTime;
      }
      if (audioPressed && !existing.userAudioResponse) {
        existing.userAudioResponse = true;
        existing.audioReactionTime = reactionTime;
      }
    } else {
      // Create new response
      responses.value.push({
        trialIndex: currentTrialIndex.value,
        userPositionResponse: positionPressed,
        userAudioResponse: audioPressed,
        positionReactionTime: positionPressed ? reactionTime : null,
        audioReactionTime: audioPressed ? reactionTime : null,
        positionOutcome: null,  // Will be calculated at trial end
        audioOutcome: null,
      });
    }
  }

  function endTrial() {
    if (!currentTrial.value) return;

    // Calculate outcomes for non-warmup trials
    if (!currentTrial.value.isWarmup) {
      const responseIdx = responses.value.findIndex(r => r.trialIndex === currentTrialIndex.value);

      if (responseIdx >= 0) {
        const response = responses.value[responseIdx];
        response.positionOutcome = getOutcome(
          currentTrial.value.positionMatch,
          response.userPositionResponse
        );
        response.audioOutcome = getOutcome(
          currentTrial.value.audioMatch,
          response.userAudioResponse
        );
      } else {
        // No response recorded - create one with no presses
        responses.value.push({
          trialIndex: currentTrialIndex.value,
          userPositionResponse: false,
          userAudioResponse: false,
          positionReactionTime: null,
          audioReactionTime: null,
          positionOutcome: getOutcome(currentTrial.value.positionMatch, false),
          audioOutcome: getOutcome(currentTrial.value.audioMatch, false),
        });
      }
    }

    // Move to next trial
    currentTrialIndex.value++;
    stimulusOnsetTime.value = null;

    // Check if session is complete
    if (currentTrialIndex.value >= sequence.value.length) {
      status.value = 'finished';
    }
  }

  function finishSession(): Session | null {
    if (startedAt.value === null) return null;

    status.value = 'finished';

    const session = generateSessionRecord(
      sessionId.value,
      nLevel.value,
      sequence.value,
      responses.value,
      adaptiveMode.value,
      true,
      startedAt.value
    );

    // Update adaptive level if enabled
    if (adaptiveMode.value) {
      adaptiveNLevel.value = calculateAdaptiveLevel(
        nLevel.value,
        session.positionAccuracy,
        session.audioAccuracy,
        session.combinedAccuracy
      );
    }

    return session;
  }

  function pauseSession() {
    if (status.value === 'playing' || status.value === 'warmup') {
      status.value = 'paused';
    }
  }

  function resumeSession() {
    if (status.value === 'paused') {
      status.value = currentTrial.value?.isWarmup ? 'warmup' : 'playing';
    }
  }

  function resetSession() {
    status.value = 'idle';
    sequence.value = [];
    responses.value = [];
    currentTrialIndex.value = 0;
    sessionId.value = '';
    startedAt.value = null;
    stimulusOnsetTime.value = null;
  }

  function setNLevel(level: number) {
    nLevel.value = Math.max(MIN_N_LEVEL, Math.min(MAX_N_LEVEL, level));
  }

  function toggleAdaptiveMode() {
    adaptiveMode.value = !adaptiveMode.value;
  }

  function toggleSoundEffects() {
    soundEffectsEnabled.value = !soundEffectsEnabled.value;
  }

  // For session recovery
  function getSessionState(): GameState {
    return {
      status: status.value,
      nLevel: nLevel.value,
      currentTrialIndex: currentTrialIndex.value,
      sequence: sequence.value,
      responses: responses.value,
      sessionId: sessionId.value,
      startedAt: startedAt.value,
      stimulusOnsetTime: stimulusOnsetTime.value,
    };
  }

  function restoreSession(state: GameState) {
    status.value = state.status;
    nLevel.value = state.nLevel;
    currentTrialIndex.value = state.currentTrialIndex;
    sequence.value = state.sequence;
    responses.value = state.responses;
    sessionId.value = state.sessionId;
    startedAt.value = state.startedAt;
    stimulusOnsetTime.value = null;  // Reset stimulus timing
  }

  return {
    // State
    status,
    nLevel,
    currentTrialIndex,
    sequence,
    responses,
    sessionId,
    startedAt,
    stimulusOnsetTime,
    adaptiveMode,
    adaptiveNLevel,
    soundEffectsEnabled,

    // Computed
    currentTrial,
    isWarmup,
    progress,
    trialsRemaining,

    // Actions
    startSession,
    setStimulus,
    recordResponse,
    endTrial,
    finishSession,
    pauseSession,
    resumeSession,
    resetSession,
    setNLevel,
    toggleAdaptiveMode,
    toggleSoundEffects,
    getSessionState,
    restoreSession,
  };
});
