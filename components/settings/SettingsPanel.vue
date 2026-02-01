<script setup lang="ts">
import type { Settings } from '../../src/types/game';
import { MIN_N_LEVEL, MAX_N_LEVEL } from '../../src/utils/constants';

const props = defineProps<{
  settings: Settings;
}>();

const emit = defineEmits<{
  (e: 'update', key: keyof Settings, value: Settings[keyof Settings]): void;
  (e: 'clearData'): void;
}>();

function updateNLevel(delta: number) {
  const newLevel = Math.max(MIN_N_LEVEL, Math.min(MAX_N_LEVEL, props.settings.defaultNLevel + delta));
  emit('update', 'defaultNLevel', newLevel);
}
</script>

<template>
  <div class="settings-panel">
    <h2 class="title">Settings</h2>

    <!-- Default N-Level -->
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Default N-Level</span>
        <span class="setting-desc">Starting level for manual mode</span>
      </div>
      <div class="level-control">
        <button
          class="level-btn"
          :disabled="settings.defaultNLevel <= MIN_N_LEVEL"
          @click="updateNLevel(-1)"
        >−</button>
        <span class="level-value">{{ settings.defaultNLevel }}</span>
        <button
          class="level-btn"
          :disabled="settings.defaultNLevel >= MAX_N_LEVEL"
          @click="updateNLevel(1)"
        >+</button>
      </div>
    </div>

    <!-- Adaptive Mode -->
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Adaptive Difficulty</span>
        <span class="setting-desc">Auto-adjust level based on performance</span>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          :checked="settings.adaptiveMode"
          @change="emit('update', 'adaptiveMode', !settings.adaptiveMode)"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Sound Effects -->
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Sound Effects</span>
        <span class="setting-desc">Play sounds for correct/incorrect</span>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          :checked="settings.soundEffectsEnabled"
          @change="emit('update', 'soundEffectsEnabled', !settings.soundEffectsEnabled)"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Reminders -->
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Daily Reminders</span>
        <span class="setting-desc">Get notified to train</span>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          :checked="settings.reminderEnabled"
          @change="emit('update', 'reminderEnabled', !settings.reminderEnabled)"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Danger Zone -->
    <div class="danger-zone">
      <button class="danger-btn" @click="emit('clearData')">
        Clear All Data
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 8px 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 11px;
  color: var(--text-tertiary);
}

.level-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--accent-subtle);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.1s ease;
}

.level-btn:hover:not(:disabled) {
  border-color: var(--accent-light);
}

.level-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.level-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 20px;
  text-align: center;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--accent-light);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
  background-color: var(--bg-primary);
}

.danger-zone {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--accent-subtle);
}

.danger-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--incorrect);
  border-radius: 8px;
  background-color: transparent;
  color: var(--incorrect);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.danger-btn:hover {
  background-color: rgba(248, 113, 113, 0.1);
}
</style>
