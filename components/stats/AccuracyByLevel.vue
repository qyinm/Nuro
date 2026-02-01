<script setup lang="ts">
import { computed } from 'vue';

interface LevelData {
  level: number;
  avgAccuracy: number;
  sessionCount: number;
}

const props = defineProps<{
  data: LevelData[];
}>();

const maxAccuracy = computed(() => {
  if (props.data.length === 0) return 100;
  return Math.max(...props.data.map(d => d.avgAccuracy), 100);
});
</script>

<template>
  <div class="accuracy-by-level">
    <h3 class="section-title">Accuracy by Level</h3>

    <div v-if="data.length === 0" class="empty-state">
      <p>No data yet</p>
    </div>

    <div v-else class="bar-chart">
      <div
        v-for="item in data"
        :key="item.level"
        class="bar-row"
      >
        <span class="bar-label">{{ item.level }}-back</span>
        <div class="bar-container">
          <div
            class="bar-fill"
            :style="{ width: `${(item.avgAccuracy / maxAccuracy) * 100}%` }"
            :class="{ good: item.avgAccuracy >= 80, poor: item.avgAccuracy < 50 }"
          />
        </div>
        <span class="bar-value">{{ item.avgAccuracy }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accuracy-by-level {
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

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 50px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.bar-container {
  flex: 1;
  height: 16px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: var(--accent-light);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar-fill.good {
  background-color: var(--correct);
}

.bar-fill.poor {
  background-color: var(--incorrect);
}

.bar-value {
  width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: right;
  flex-shrink: 0;
}
</style>
