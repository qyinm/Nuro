<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameStore } from '../../src/stores/gameStore';
import { useStatsStore } from '../../src/stores/statsStore';
import { useAudio } from '../../src/composables/useAudio';
import { useKeyboard } from '../../src/composables/useKeyboard';
import { useStorage } from '../../src/composables/useStorage';
import { TRIAL_INTERVAL_MS, STIMULUS_DURATION_MS, DEFAULT_SETTINGS } from '../../src/utils/constants';
import type { Session, Settings, InterruptedSession } from '../../src/types/game';

// Components
import GameBoard from '../../components/game/GameBoard.vue';
import GameControls from '../../components/game/GameControls.vue';
import GameStatus from '../../components/game/GameStatus.vue';
import InputIndicator from '../../components/game/InputIndicator.vue';
import GameResults from '../../components/game/GameResults.vue';
import ResumeDialog from '../../components/game/ResumeDialog.vue';
import NavBar from '../../components/ui/NavBar.vue';
import StatsOverview from '../../components/stats/StatsOverview.vue';
import TrendChart from '../../components/stats/TrendChart.vue';
import SessionHistory from '../../components/stats/SessionHistory.vue';
import AccuracyByLevel from '../../components/stats/AccuracyByLevel.vue';
import SettingsPanel from '../../components/settings/SettingsPanel.vue';
import Tutorial from '../../components/onboarding/Tutorial.vue';

const gameStore = useGameStore();
const statsStore = useStatsStore();
const storage = useStorage();
const audio = useAudio();

// View state
type View = 'game' | 'stats' | 'settings';
const currentView = ref<View>('game');
const settings = ref<Settings>({ ...DEFAULT_SETTINGS });

// Local game state
const activePosition = ref<number | null>(null);
const showFeedback = ref(false);
const feedbackType = ref<'correct' | 'incorrect' | null>(null);
const positionPressed = ref(false);
const audioPressed = ref(false);
const lastSession = ref<Session | null>(null);
const previousLevel = ref(0);

// Session recovery
const interruptedSession = ref<InterruptedSession | null>(null);
const showResumeDialog = ref(false);

// Tutorial
const showTutorial = ref(false);

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
    if (currentView.value !== 'game') return;
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

const showNav = computed(() =>
  !showTutorial.value && (gameStore.status === 'idle' || gameStore.status === 'finished')
);

// Game loop
let gameLoopTimer: ReturnType<typeof setTimeout> | null = null;

function startGame() {
  previousLevel.value = gameStore.adaptiveMode ? gameStore.adaptiveNLevel : gameStore.nLevel;
  gameStore.startSession();
  lastSession.value = null;
  showResumeDialog.value = false;
  runTrial();
}

function runTrial() {
  if (!gameStore.currentTrial) {
    endGame();
    return;
  }

  if (gameStore.status === 'paused') return;

  // Save state for recovery
  saveSessionState();

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
  saveSessionState();
}

function resumeGame() {
  gameStore.resumeSession();
  runTrial();
}

async function endGame() {
  if (gameLoopTimer) {
    clearTimeout(gameLoopTimer);
    gameLoopTimer = null;
  }

  // Clear interrupted session
  await storage.clearInterruptedSession();

  // Generate and save session record
  if (gameStore.startedAt) {
    lastSession.value = gameStore.finishSession();
    if (lastSession.value) {
      await statsStore.addSession(lastSession.value);
      await storage.saveSettings({
        adaptiveNLevel: gameStore.adaptiveNLevel,
      });
    }
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

// Session recovery
async function saveSessionState() {
  if (gameStore.status === 'idle' || gameStore.status === 'finished') return;

  const state: InterruptedSession = {
    sessionId: gameStore.sessionId,
    nLevel: gameStore.nLevel,
    currentTrialIndex: gameStore.currentTrialIndex,
    sequence: gameStore.sequence,
    responses: gameStore.responses,
    startedAt: gameStore.startedAt || Date.now(),
    interruptedAt: Date.now(),
  };

  await storage.saveInterruptedSession(state);
}

async function checkForInterruptedSession() {
  const interrupted = await storage.getInterruptedSession();
  if (interrupted) {
    interruptedSession.value = interrupted;
    showResumeDialog.value = true;
  }
}

function handleResumeSession() {
  if (!interruptedSession.value) return;

  gameStore.restoreSession({
    status: 'paused',
    nLevel: interruptedSession.value.nLevel,
    currentTrialIndex: interruptedSession.value.currentTrialIndex,
    sequence: interruptedSession.value.sequence,
    responses: interruptedSession.value.responses,
    sessionId: interruptedSession.value.sessionId,
    startedAt: interruptedSession.value.startedAt,
    stimulusOnsetTime: null,
  });

  showResumeDialog.value = false;
  interruptedSession.value = null;
  resumeGame();
}

async function handleDiscardSession() {
  await storage.clearInterruptedSession();
  showResumeDialog.value = false;
  interruptedSession.value = null;
}

// Navigation
function handleNavigate(view: View) {
  currentView.value = view;
}

// Settings
async function handleSettingsUpdate(key: keyof Settings, value: any) {
  settings.value = { ...settings.value, [key]: value };
  await storage.saveSettings({ [key]: value });

  // Sync with game store
  if (key === 'adaptiveMode') {
    gameStore.adaptiveMode = value;
  }
  if (key === 'soundEffectsEnabled') {
    gameStore.soundEffectsEnabled = value;
  }
  if (key === 'defaultNLevel') {
    gameStore.setNLevel(value);
  }
}

async function handleClearData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    await statsStore.clearAllStats();
    settings.value = { ...DEFAULT_SETTINGS };
    await storage.saveSettings(settings.value);
  }
}

// Tutorial
async function handleTutorialComplete() {
  showTutorial.value = false;
  settings.value.hasCompletedOnboarding = true;
  await storage.saveSettings({ hasCompletedOnboarding: true });
}

// Initialize
onMounted(async () => {
  // Load settings
  settings.value = await storage.getSettings();
  gameStore.adaptiveMode = settings.value.adaptiveMode;
  gameStore.adaptiveNLevel = settings.value.adaptiveNLevel;
  gameStore.soundEffectsEnabled = settings.value.soundEffectsEnabled;
  gameStore.setNLevel(settings.value.defaultNLevel);

  // Show tutorial for first-time users
  if (!settings.value.hasCompletedOnboarding) {
    showTutorial.value = true;
  }

  // Load stats
  await statsStore.loadSessions();

  // Check for interrupted session (only if not showing tutorial)
  if (!showTutorial.value) {
    await checkForInterruptedSession();
  }

  // Initialize audio
  audio.initialize();
});
</script>

<template>
  <div class="app">
    <!-- Resume Dialog -->
    <ResumeDialog
      v-if="showResumeDialog && interruptedSession"
      :session="interruptedSession"
      @resume="handleResumeSession"
      @discard="handleDiscardSession"
    />

    <header class="header">
      <h1 class="title">Dual N-Back</h1>
    </header>

    <main class="main">
      <!-- Tutorial -->
      <template v-if="showTutorial">
        <Tutorial @complete="handleTutorialComplete" />
      </template>

      <!-- Game View -->
      <template v-else-if="currentView === 'game'">
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

          <div v-if="audio.state.value.errorMessage" class="warning">
            {{ audio.state.value.errorMessage }}
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
      </template>

      <!-- Stats View -->
      <template v-else-if="currentView === 'stats'">
        <div class="stats-view">
          <StatsOverview
            :total-sessions="statsStore.totalSessions"
            :average-accuracy="statsStore.averageAccuracy"
            :current-streak="statsStore.currentStreak"
            :best-level="statsStore.bestNLevel"
            :total-minutes="statsStore.totalTrainingTime"
            :avg-reaction-time="statsStore.averageReactionTime"
          />
          <TrendChart :data="statsStore.accuracyTrend" />
          <AccuracyByLevel :data="statsStore.accuracyByLevel" />
          <SessionHistory :sessions="statsStore.recentSessions" />
        </div>
      </template>

      <!-- Settings View -->
      <template v-else-if="currentView === 'settings'">
        <SettingsPanel
          :settings="settings"
          @update="handleSettingsUpdate"
          @clear-data="handleClearData"
        />
      </template>
    </main>

    <!-- Navigation -->
    <NavBar
      v-if="showNav"
      :active-view="currentView"
      @navigate="handleNavigate"
    />
  </div>
</template>

<style scoped>
.app {
  width: 360px;
  height: 540px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.header {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 1px solid var(--accent-subtle);
  flex-shrink: 0;
}

.title {
  font-size: 16px;
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
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.stats-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 8px;
}

.warning {
  padding: 10px 14px;
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
