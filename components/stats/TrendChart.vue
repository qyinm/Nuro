<script setup lang="ts">
import { computed } from 'vue';

interface DataPoint {
  timestamp: number;
  accuracy: number;
  nLevel: number;
}

const props = defineProps<{
  data: DataPoint[];
}>();

const chartWidth = 280;
const chartHeight = 120;
const padding = { top: 10, right: 10, bottom: 20, left: 30 };

const innerWidth = chartWidth - padding.left - padding.right;
const innerHeight = chartHeight - padding.top - padding.bottom;

const points = computed(() => {
  if (props.data.length === 0) return '';

  const xStep = innerWidth / Math.max(props.data.length - 1, 1);

  return props.data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + innerHeight - (d.accuracy / 100) * innerHeight;
    return `${x},${y}`;
  }).join(' ');
});

const areaPath = computed(() => {
  if (props.data.length === 0) return '';

  const xStep = innerWidth / Math.max(props.data.length - 1, 1);

  let path = `M ${padding.left},${padding.top + innerHeight}`;

  props.data.forEach((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + innerHeight - (d.accuracy / 100) * innerHeight;
    path += ` L ${x},${y}`;
  });

  path += ` L ${padding.left + (props.data.length - 1) * xStep},${padding.top + innerHeight}`;
  path += ' Z';

  return path;
});

const yLabels = [0, 50, 100];
</script>

<template>
  <div class="trend-chart">
    <h3 class="chart-title">Accuracy Trend</h3>

    <svg :width="chartWidth" :height="chartHeight" class="chart-svg">
      <!-- Y-axis labels -->
      <g class="y-axis">
        <template v-for="label in yLabels" :key="label">
          <text
            :x="padding.left - 8"
            :y="padding.top + innerHeight - (label / 100) * innerHeight + 4"
            class="axis-label"
          >
            {{ label }}
          </text>
          <line
            :x1="padding.left"
            :y1="padding.top + innerHeight - (label / 100) * innerHeight"
            :x2="padding.left + innerWidth"
            :y2="padding.top + innerHeight - (label / 100) * innerHeight"
            class="grid-line"
          />
        </template>
      </g>

      <!-- Area fill -->
      <path
        v-if="data.length > 0"
        :d="areaPath"
        class="area-fill"
      />

      <!-- Line -->
      <polyline
        v-if="data.length > 0"
        :points="points"
        class="trend-line"
      />

      <!-- Points -->
      <g v-if="data.length > 0" class="data-points">
        <circle
          v-for="(d, i) in data"
          :key="i"
          :cx="padding.left + i * (innerWidth / Math.max(data.length - 1, 1))"
          :cy="padding.top + innerHeight - (d.accuracy / 100) * innerHeight"
          r="3"
          class="data-point"
        />
      </g>

      <!-- No data message -->
      <text
        v-if="data.length === 0"
        :x="chartWidth / 2"
        :y="chartHeight / 2"
        class="no-data"
      >
        No data yet
      </text>
    </svg>
  </div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
}

.chart-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-svg {
  display: block;
}

.axis-label {
  font-size: 10px;
  fill: var(--text-tertiary);
  text-anchor: end;
}

.grid-line {
  stroke: var(--accent-subtle);
  stroke-width: 1;
  stroke-dasharray: 2, 2;
}

.area-fill {
  fill: rgba(0, 0, 0, 0.05);
}

.trend-line {
  fill: none;
  stroke: var(--accent-light);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.data-point {
  fill: var(--accent-light);
}

.no-data {
  font-size: 12px;
  fill: var(--text-tertiary);
  text-anchor: middle;
}
</style>
