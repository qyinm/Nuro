<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { INPUT_FLASH_DURATION_MS } from '../../src/utils/constants';

const props = defineProps<{
  positionPressed: boolean;
  audioPressed: boolean;
  disabled: boolean;
}>();

const positionFlash = ref(false);
const audioFlash = ref(false);

let positionTimer: ReturnType<typeof setTimeout> | null = null;
let audioTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.positionPressed, (pressed) => {
  if (pressed) {
    positionFlash.value = true;
    if (positionTimer) clearTimeout(positionTimer);
    positionTimer = setTimeout(() => positionFlash.value = false, INPUT_FLASH_DURATION_MS);
  }
});

watch(() => props.audioPressed, (pressed) => {
  if (pressed) {
    audioFlash.value = true;
    if (audioTimer) clearTimeout(audioTimer);
    audioTimer = setTimeout(() => audioFlash.value = false, INPUT_FLASH_DURATION_MS);
  }
});

onUnmounted(() => {
  if (positionTimer) clearTimeout(positionTimer);
  if (audioTimer) clearTimeout(audioTimer);
});
</script>

<template>
  <div class="input-indicator" :class="{ disabled }">
    <div class="key-group">
      <div class="key" :class="{ active: positionFlash }">
        <span class="key-letter">A</span>
      </div>
      <span class="key-label">Position</span>
    </div>
    <div class="key-group">
      <div class="key" :class="{ active: audioFlash }">
        <span class="key-letter">F</span>
      </div>
      <span class="key-label">Audio</span>
    </div>
  </div>
</template>

<style scoped>
.input-indicator {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 16px;
  transition: opacity 0.2s ease;
}

.input-indicator.disabled {
  opacity: 0.3;
}

.key-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.key {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border: 2px solid var(--accent-subtle);
  border-radius: 8px;
  transition: all 0.1s ease;
}

.key.active {
  background-color: var(--accent-light);
  border-color: var(--accent-light);
  transform: scale(0.95);
}

.key-letter {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.key.active .key-letter {
  color: var(--bg-primary);
}

.key-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
