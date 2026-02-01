<script setup lang="ts">
defineProps<{
  nLevel: number;
  progress: number;
  trialsRemaining: number;
  isWarmup: boolean;
  isPaused: boolean;
}>();
</script>

<template>
  <div class="status">
    <div class="status-row">
      <div class="status-item">
        <span class="status-label">Level</span>
        <span class="status-value">{{ nLevel }}-back</span>
      </div>
      <div class="status-item">
        <span class="status-label">Remaining</span>
        <span class="status-value">{{ trialsRemaining }}</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progress}%` }" />
    </div>

    <!-- Status indicator -->
    <div v-if="isWarmup" class="warmup-indicator">
      <span class="pulse"></span>
      Get Ready...
    </div>
    <div v-else-if="isPaused" class="paused-indicator">
      Paused
    </div>
  </div>
</template>

<style scoped>
.status {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-row {
  display: flex;
  justify-content: space-between;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.status-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-container {
  width: 100%;
  height: 4px;
  background-color: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--accent-light);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.warmup-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 14px;
  color: var(--warning);
  font-weight: 500;
}

.pulse {
  width: 8px;
  height: 8px;
  background-color: var(--warning);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.paused-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
