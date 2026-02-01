<script setup lang="ts">
const emit = defineEmits<{
  (e: 'complete'): void;
}>();
</script>

<template>
  <div class="tutorial">
    <h2 class="title">How to Play</h2>

    <div class="section">
      <h3 class="section-title">The Goal</h3>
      <p class="description">
        Remember what you saw and heard <strong>N trials ago</strong>.
        In 2-back, remember 2 trials back. In 3-back, 3 trials back, and so on.
      </p>
    </div>

    <div class="section">
      <h3 class="section-title">Two Stimuli</h3>
      <div class="stimuli-grid">
        <div class="stimulus-item">
          <div class="stimulus-icon grid-icon">
            <div class="mini-grid">
              <span></span><span></span><span></span>
              <span></span><span class="active"></span><span></span>
              <span></span><span></span><span></span>
            </div>
          </div>
          <span class="stimulus-label">Position</span>
          <span class="stimulus-desc">Where the square appears</span>
        </div>
        <div class="stimulus-item">
          <div class="stimulus-icon audio-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </div>
          <span class="stimulus-label">Audio</span>
          <span class="stimulus-desc">The letter you hear</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Controls</h3>
      <div class="controls-grid">
        <div class="control-item">
          <kbd>A</kbd>
          <span>Position matches N-back</span>
        </div>
        <div class="control-item">
          <kbd>F</kbd>
          <span>Audio matches N-back</span>
        </div>
      </div>
      <p class="control-note">
        Press both if both match. Press nothing if neither matches.
      </p>
    </div>

    <div class="section">
      <h3 class="section-title">Scoring</h3>
      <p class="description">
        You earn points for correctly identifying matches <em>and</em>
        correctly not pressing when there's no match.
      </p>
    </div>

    <button class="start-btn" @click="emit('complete')">
      Got it, let's play!
    </button>
  </div>
</template>

<style scoped>
.tutorial {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  width: 100%;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.description strong {
  color: var(--text-primary);
}

.stimuli-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stimulus-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.stimulus-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 36px;
  height: 36px;
}

.mini-grid span {
  background-color: var(--bg-tertiary);
  border-radius: 2px;
}

.mini-grid span.active {
  background-color: var(--accent-light);
}

.stimulus-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.stimulus-desc {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
}

.controls-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background-color: var(--bg-secondary);
  border-radius: 6px;
}

.control-item kbd {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--accent-subtle);
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.control-item span {
  font-size: 13px;
  color: var(--text-secondary);
}

.control-note {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 4px 0 0 0;
  font-style: italic;
}

.start-btn {
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  border: none;
  border-radius: 8px;
  background-color: var(--accent-light);
  color: var(--bg-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
