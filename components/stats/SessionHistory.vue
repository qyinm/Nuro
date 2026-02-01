<script setup lang="ts">
import type { Session } from '../../src/types/game';

defineProps<{
  sessions: Session[];
}>();

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="session-history">
    <h3 class="section-title">Recent Sessions</h3>

    <div v-if="sessions.length === 0" class="empty-state">
      <p>No sessions yet</p>
    </div>

    <div v-else class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
      >
        <div class="session-left">
          <span class="session-level">{{ session.nLevel }}-back</span>
          <span class="session-date">{{ formatDate(session.timestamp) }} · {{ formatTime(session.timestamp) }}</span>
        </div>
        <div class="session-right">
          <span class="session-accuracy" :class="{ good: session.combinedAccuracy >= 80, poor: session.combinedAccuracy < 50 }">
            {{ session.combinedAccuracy }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-history {
  width: 100%;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.session-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-level {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.session-date {
  font-size: 11px;
  color: var(--text-tertiary);
}

.session-right {
  display: flex;
  align-items: center;
}

.session-accuracy {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
}

.session-accuracy.good {
  color: var(--correct);
}

.session-accuracy.poor {
  color: var(--incorrect);
}
</style>
