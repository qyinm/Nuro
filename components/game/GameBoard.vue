<script setup lang="ts">
import { computed } from 'vue';
import { GRID_SIZE } from '../../src/utils/constants';

const props = defineProps<{
  activePosition: number | null;
  showFeedback: boolean;
  feedbackType: 'correct' | 'incorrect' | null;
}>();

const cells = computed(() => {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    index: i,
    isActive: props.activePosition === i,
  }));
});
</script>

<template>
  <div class="game-board">
    <div
      v-for="cell in cells"
      :key="cell.index"
      class="cell"
      :class="{
        'cell-active': cell.isActive,
        'cell-correct': showFeedback && feedbackType === 'correct' && cell.isActive,
        'cell-incorrect': showFeedback && feedbackType === 'incorrect' && cell.isActive,
      }"
    />
  </div>
</template>

<style scoped>
.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 156px;
  height: 156px;
  padding: 8px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
}

.cell {
  width: 44px;
  height: 44px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  transition: all 0.15s ease-out;
  border: 2px solid transparent;
}

.cell-active {
  background-color: var(--accent-light);
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.cell-correct {
  background-color: var(--correct);
  border-color: var(--correct);
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
}

.cell-incorrect {
  background-color: var(--incorrect);
  border-color: var(--incorrect);
  box-shadow: 0 0 20px rgba(248, 113, 113, 0.5);
}
</style>
