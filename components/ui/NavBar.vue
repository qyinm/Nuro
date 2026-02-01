<script setup lang="ts">
defineProps<{
  activeView: 'game' | 'stats' | 'settings';
}>();

const emit = defineEmits<{
  (e: 'navigate', view: 'game' | 'stats' | 'settings'): void;
}>();
</script>

<template>
  <nav class="navbar">
    <button
      class="nav-btn"
      :class="{ active: activeView === 'game' }"
      @click="emit('navigate', 'game')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
      <span>Play</span>
    </button>

    <button
      class="nav-btn"
      :class="{ active: activeView === 'stats' }"
      @click="emit('navigate', 'stats')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
      <span>Stats</span>
    </button>

    <button
      class="nav-btn"
      :class="{ active: activeView === 'settings' }"
      @click="emit('navigate', 'settings')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      <span>Settings</span>
    </button>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-around;
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--accent-subtle);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 0.15s ease;
  border-radius: 8px;
}

.nav-btn:hover {
  color: var(--text-secondary);
}

.nav-btn.active {
  color: var(--text-primary);
}

.nav-btn span {
  font-size: 11px;
  font-weight: 500;
}
</style>
