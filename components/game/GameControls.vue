<script setup lang="ts">
import { MIN_N_LEVEL, MAX_N_LEVEL } from '../../src/utils/constants';

const props = defineProps<{
  nLevel: number;
  adaptiveMode: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:nLevel', value: number): void;
  (e: 'toggleAdaptive'): void;
  (e: 'start'): void;
}>();

function decrementLevel() {
  if (props.nLevel > MIN_N_LEVEL) {
    emit('update:nLevel', props.nLevel - 1);
  }
}

function incrementLevel() {
  if (props.nLevel < MAX_N_LEVEL) {
    emit('update:nLevel', props.nLevel + 1);
  }
}
</script>

<template>
  <div class="controls">
    <!-- N-Level Selector -->
    <div class="level-selector">
      <span class="label">N-Back Level</span>
      <div class="level-buttons">
        <button
          class="level-btn"
          :disabled="nLevel <= MIN_N_LEVEL || adaptiveMode"
          @click="decrementLevel"
        >
          −
        </button>
        <span class="level-value">{{ nLevel }}</span>
        <button
          class="level-btn"
          :disabled="nLevel >= MAX_N_LEVEL || adaptiveMode"
          @click="incrementLevel"
        >
          +
        </button>
      </div>
    </div>

    <!-- Adaptive Mode Toggle -->
    <div class="adaptive-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          :checked="adaptiveMode"
          @change="emit('toggleAdaptive')"
        />
        <span class="toggle-switch"></span>
        <span class="toggle-text">Adaptive</span>
      </label>
    </div>

    <!-- Start Button -->
    <button
      class="start-btn"
      :disabled="disabled"
      @click="emit('start')"
    >
      Start Session
    </button>

    <p class="hint">Press <kbd>Space</kbd> to start</p>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.level-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.level-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--accent-subtle);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.1s ease;
}

.level-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-light);
}

.level-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.level-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 40px;
  text-align: center;
}

.adaptive-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-label input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background-color: var(--bg-tertiary);
  border-radius: 12px;
  position: relative;
  transition: background-color 0.2s ease;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-label input:checked + .toggle-switch {
  background-color: var(--accent-light);
}

.toggle-label input:checked + .toggle-switch::after {
  left: 22px;
  background-color: var(--bg-primary);
}

.toggle-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.start-btn {
  width: 100%;
  max-width: 200px;
  padding: 14px 24px;
  border-radius: 8px;
  border: none;
  background-color: var(--accent-light);
  color: var(--bg-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0;
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
