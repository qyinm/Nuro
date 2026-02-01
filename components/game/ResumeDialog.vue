<script setup lang="ts">
import type { InterruptedSession } from '../../src/types/game';

defineProps<{
  session: InterruptedSession;
}>();

const emit = defineEmits<{
  (e: 'resume'): void;
  (e: 'discard'): void;
}>();

function formatTimeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  return `${minutes} minutes ago`;
}
</script>

<template>
  <div class="resume-dialog-overlay">
    <div class="resume-dialog">
      <h2 class="title">Resume Session?</h2>

      <p class="message">
        You have an unfinished {{ session.nLevel }}-back session from {{ formatTimeAgo(session.interruptedAt) }}.
      </p>

      <div class="progress-info">
        <span class="progress-label">Progress</span>
        <span class="progress-value">
          {{ session.currentTrialIndex }} / {{ session.sequence.length }} trials
        </span>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="emit('resume')">
          Resume
        </button>
        <button class="btn-secondary" @click="emit('discard')">
          Start New
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resume-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.resume-dialog {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

.message {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
}

.progress-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.progress-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: var(--accent-light);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
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
  border-color: var(--text-tertiary);
  color: var(--text-primary);
}
</style>
