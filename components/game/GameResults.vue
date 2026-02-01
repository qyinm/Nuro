<script setup lang="ts">
import type { Session } from '../../src/types/game';

defineProps<{
  session: Session;
  newLevel: number | null;
  levelChanged: 'up' | 'down' | 'same';
}>();

const emit = defineEmits<{
  (e: 'playAgain'): void;
  (e: 'goHome'): void;
}>();
</script>

<template>
  <div class="results">
    <h2 class="title">Session Complete</h2>

    <!-- Overall Score -->
    <div class="score-circle">
      <span class="score-value">{{ session.combinedAccuracy }}%</span>
      <span class="score-label">Combined</span>
    </div>

    <!-- Detailed Scores -->
    <div class="scores-row">
      <div class="score-item">
        <span class="score-type">Position</span>
        <span class="score-percent">{{ session.positionAccuracy }}%</span>
      </div>
      <div class="score-item">
        <span class="score-type">Audio</span>
        <span class="score-percent">{{ session.audioAccuracy }}%</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <span class="stat-label">Level</span>
        <span class="stat-value">{{ session.nLevel }}-back</span>
      </div>
      <div class="stat">
        <span class="stat-label">Trials</span>
        <span class="stat-value">{{ session.scoredTrials }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Avg RT</span>
        <span class="stat-value">{{ session.avgReactionTime }}ms</span>
      </div>
    </div>

    <!-- Adaptive Level Change -->
    <div v-if="session.adaptiveEnabled && newLevel !== null" class="level-change">
      <template v-if="levelChanged === 'up'">
        <span class="change-icon up">↑</span>
        <span class="change-text">Level up to {{ newLevel }}-back!</span>
      </template>
      <template v-else-if="levelChanged === 'down'">
        <span class="change-icon down">↓</span>
        <span class="change-text">Adjusted to {{ newLevel }}-back</span>
      </template>
      <template v-else>
        <span class="change-text">Staying at {{ newLevel }}-back</span>
      </template>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn-primary" @click="emit('playAgain')">
        Play Again
      </button>
      <button class="btn-secondary" @click="emit('goHome')">
        Back to Menu
      </button>
    </div>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 24px;
  width: 100%;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  border: 3px solid var(--accent-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.score-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.scores-row {
  display: flex;
  gap: 32px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-type {
  font-size: 12px;
  color: var(--text-secondary);
}

.score-percent {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.level-change {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.change-icon {
  font-size: 18px;
  font-weight: 700;
}

.change-icon.up {
  color: var(--correct);
}

.change-icon.down {
  color: var(--warning);
}

.change-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 200px;
  margin-top: 8px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background-color: var(--accent-light);
  color: var(--bg-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--accent-subtle);
  border-radius: 8px;
  background-color: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  border-color: var(--accent-light);
  color: var(--text-primary);
}
</style>
