<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameStore } from '../../src/stores/gameStore';
import { useAudio } from '../../src/composables/useAudio';
import { useKeyboard } from '../../src/composables/useKeyboard';
import { TRIAL_INTERVAL_MS, STIMULUS_DURATION_MS } from '../../src/utils/constants';
import GameBoard from '../../components/game/GameBoard.vue';
import GameControls from '../../components/game/GameControls.vue';
import GameStatus from '../../components/game/GameStatus.vue';
import InputIndicator from '../../components/game/InputIndicator.vue';
import GameResults from '../../components/game/GameResults.vue';
import type { Session } from '../../src/types/game';

const gameStore = useGameStore();
const audio = useAudio();

// Local state
const activePosition = ref<number | null>(null);
const showFeedback = ref(false);
const feedbackType = ref<'correct' | 'incorrect' | null>(null);
const positionPressed = ref(false);
const audioPressed = ref(false);
const lastSession = ref<Session | null>(null);
const previousLevel = ref(0);

// Keyboard handling
const keyboard = useKeyboard({
  onPositionPress: () => {
    if (gameStore.status === 'playing') {
      positionPressed.value = true;
      gameStore.recordResponse(true, false);
    }
  },
  onAudioPress: () => {
    if (gameStore.status === 'playing') {
      audioPressed.value = true;
      gameStore.recordResponse(false, true);
    }
  },
  onStartPause: () => {
    if (gameStore.status === 'idle' || gameStore.status === 'finished') {
      startGame();
    } else if (gameStore.status === 'paused') {
      resumeGame();
    } else if (gameStore.status === 'playing' || gameStore.status === 'warmup') {
      pauseGame();
    }
  },
  onEscape: () => {
    if (gameStore.status !== 'idle') {
      goHome();
    }
  },
});

// Computed
const isPlaying = computed(() =>
  gameStore.status === 'playing' ||
  gameStore.status === 'warmup' ||
  gameStore.status === 'paused'
);

const levelChange = computed(() => {
  if (!lastSession.value?.adaptiveEnabled) return 'same';
  if (gameStore.adaptiveNLevel > previousLevel.value) return 'up';
  if (gameStore.adaptiveNLevel < previousLevel.value) return 'down';
  return 'same';
});

// Game loop
let gameLoopTimer: ReturnType<typeof setTimeout> | null = null;

function startGame() {
  previousLevel.value = gameStore.adaptiveMode ? gameStore.adaptiveNLevel : gameStore.nLevel;
  gameStore.startSession();
  lastSession.value = null;
  runTrial();
}

function runTrial() {
  if (!gameStore.currentTrial) {
    endGame();
    return;
  }

  if (gameStore.status === 'paused') return;

  // Reset input state
  positionPressed.value = false;
  audioPressed.value = false;
  showFeedback.value = false;
  feedbackType.value = null;

  // Show stimulus
  activePosition.value = gameStore.currentTrial.position;
  gameStore.setStimulus();
  keyboard.startResponseWindow();

  // Play audio
  if (audio.isReady.value) {
    audio.speakLetter(gameStore.currentTrial.letter);
  }

  // Hide stimulus after duration
  setTimeout(() => {
    activePosition.value = null;
  }, STIMULUS_DURATION_MS);

  // End trial and move to next
  gameLoopTimer = setTimeout(() => {
    keyboard.endResponseWindow();

    // Show feedback for scored trials
    if (!gameStore.isWarmup) {
      const trial = gameStore.currentTrial;
      const response = gameStore.responses.find(r => r.trialIndex === gameStore.currentTrialIndex);

      if (trial && response) {
        const posCorrect = trial.positionMatch === response.userPositionResponse;
        const audioCorrect = trial.audioMatch === response.userAudioResponse;

        if (posCorrect && audioCorrect) {
          feedbackType.value = 'correct';
        } else {
          feedbackType.value = 'incorrect';
        }
        showFeedback.value = true;
      }
    }

    gameStore.endTrial();

    // Continue to next trial or end
    if (gameStore.status !== 'finished') {
      setTimeout(() => {
        showFeedback.value = false;
        runTrial();
      }, 200);
    } else {
      endGame();
    }
  }, TRIAL_INTERVAL_MS);
}

function pauseGame() {
  gameStore.pauseSession();
  if (gameLoopTimer) {
    clearTimeout(gameLoopTimer);
    gameLoopTimer = null;
  }
  audio.stop();
}

function resumeGame() {
  gameStore.resumeSession();
  runTrial();
}

function endGame() {
  if (gameLoopTimer) {
    clearTimeout(gameLoopTimer);
    gameLoopTimer = null;
  }

  // Generate session record
  if (gameStore.startedAt) {
    lastSession.value = gameStore.finishSession();
  }
}

function goHome() {
  if (gameLoopTimer) {
    clearTimeout(gameLoopTimer);
    gameLoopTimer = null;
  }
  audio.stop();
  gameStore.resetSession();
  lastSession.value = null;
  activePosition.value = null;
  showFeedback.value = false;
}

function playAgain() {
  startGame();
}

// Initialize audio on mount
onMounted(() => {
  audio.initialize();
});
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Dual N-Back</h1>
    </header>

    <main class="main">
      <!-- Idle State -->
      <template v-if="gameStore.status === 'idle'">
        <GameBoard
          :active-position="null"
          :show-feedback="false"
          :feedback-type="null"
        />
        <GameControls
          :n-level="gameStore.adaptiveMode ? gameStore.adaptiveNLevel : gameStore.nLevel"
          :adaptive-mode="gameStore.adaptiveMode"
          :disabled="false"
          @update:n-level="gameStore.setNLevel"
          @toggle-adaptive="gameStore.toggleAdaptiveMode"
          @start="startGame"
        />

        <!-- Audio warning -->
        <div v-if="audio.state.value.errorMessage" class="warning">
          ⚠️ {{ audio.state.value.errorMessage }}
        </div>
      </template>

      <!-- Playing State -->
      <template v-else-if="isPlaying">
        <GameStatus
          :n-level="gameStore.nLevel"
          :progress="gameStore.progress"
          :trials-remaining="gameStore.trialsRemaining"
          :is-warmup="gameStore.isWarmup"
          :is-paused="gameStore.status === 'paused'"
        />
        <GameBoard
          :active-position="activePosition"
          :show-feedback="showFeedback"
          :feedback-type="feedbackType"
        />
        <InputIndicator
          :position-pressed="positionPressed"
          :audio-pressed="audioPressed"
          :disabled="gameStore.isWarmup || gameStore.status === 'paused'"
        />

        <div class="game-hint">
          <span v-if="gameStore.status === 'paused'">
            Press <kbd>Space</kbd> to resume
          </span>
          <span v-else>
            Press <kbd>Esc</kbd> to quit
          </span>
        </div>
      </template>

      <!-- Results State -->
      <template v-else-if="gameStore.status === 'finished' && lastSession">
        <GameResults
          :session="lastSession"
          :new-level="gameStore.adaptiveNLevel"
          :level-changed="levelChange"
          @play-again="playAgain"
          @go-home="goHome"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.app {
  width: 360px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--accent-subtle);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
}

.warning {
  padding: 12px 16px;
  background-color: rgba(251, 191, 36, 0.1);
  border: 1px solid var(--warning);
  border-radius: 8px;
  font-size: 12px;
  color: var(--warning);
  text-align: center;
  max-width: 280px;
}

.game-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

kbd {
  display: inline-block;
  padding: 2px 6px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
}
</style>
