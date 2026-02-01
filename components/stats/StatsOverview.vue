<script setup lang="ts">
defineProps<{
  totalSessions: number;
  averageAccuracy: number;
  currentStreak: number;
  bestLevel: number;
  totalMinutes: number;
  avgReactionTime: number;
}>();
</script>

<template>
  <div class="stats-overview">
    <div class="stat-card primary">
      <span class="stat-value">{{ averageAccuracy }}%</span>
      <span class="stat-label">Avg Accuracy</span>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-value">{{ totalSessions }}</span>
        <span class="stat-label">Sessions</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ currentStreak }}</span>
        <span class="stat-label">Day Streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ bestLevel }}</span>
        <span class="stat-label">Best Level</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ totalMinutes }}m</span>
        <span class="stat-label">Total Time</span>
      </div>
    </div>

    <div class="stat-card secondary">
      <span class="stat-value">{{ avgReactionTime }}ms</span>
      <span class="stat-label">Avg Reaction Time</span>
    </div>
  </div>
</template>

<style scoped>
.stats-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.stat-card.primary {
  padding: 24px;
}

.stat-card.primary .stat-value {
  font-size: 36px;
}

.stat-card.secondary {
  padding: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
