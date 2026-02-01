import { ref, onMounted, onUnmounted } from 'vue';
import { KEYS, DEBOUNCE_MS, RESPONSE_WINDOW_MS, MIN_REACTION_TIME_MS } from '../utils/constants';

export interface KeyboardCallbacks {
  onPositionPress: () => void;
  onAudioPress: () => void;
  onStartPause: () => void;
  onEscape: () => void;
}

export function useKeyboard(callbacks: KeyboardCallbacks) {
  const lastPositionPress = ref(0);
  const lastAudioPress = ref(0);
  const enabled = ref(true);
  const responseWindowStart = ref<number | null>(null);

  /**
   * Start response window - call when stimulus is shown
   */
  function startResponseWindow(): void {
    responseWindowStart.value = performance.now();
  }

  /**
   * End response window - call when moving to next trial
   */
  function endResponseWindow(): void {
    responseWindowStart.value = null;
  }

  /**
   * Check if we're within the valid response window
   */
  function isInResponseWindow(): boolean {
    if (responseWindowStart.value === null) return false;
    const elapsed = performance.now() - responseWindowStart.value;
    return elapsed >= MIN_REACTION_TIME_MS && elapsed <= RESPONSE_WINDOW_MS;
  }

  /**
   * Enable keyboard input
   */
  function enable(): void {
    enabled.value = true;
  }

  /**
   * Disable keyboard input
   */
  function disable(): void {
    enabled.value = false;
  }

  /**
   * Handle keydown event
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (!enabled.value) return;

    const key = event.key;
    const now = performance.now();

    // Position key (A)
    if (KEYS.POSITION.includes(key)) {
      // Debounce
      if (now - lastPositionPress.value < DEBOUNCE_MS) return;
      lastPositionPress.value = now;

      // Only register if in response window
      if (isInResponseWindow()) {
        callbacks.onPositionPress();
      }
      return;
    }

    // Audio key (F)
    if (KEYS.AUDIO.includes(key)) {
      // Debounce
      if (now - lastAudioPress.value < DEBOUNCE_MS) return;
      lastAudioPress.value = now;

      // Only register if in response window
      if (isInResponseWindow()) {
        callbacks.onAudioPress();
      }
      return;
    }

    // Start/Pause (Space)
    if (KEYS.START_PAUSE.includes(key)) {
      event.preventDefault();  // Prevent scroll
      callbacks.onStartPause();
      return;
    }

    // Escape
    if (KEYS.ESCAPE.includes(key)) {
      callbacks.onEscape();
      return;
    }
  }

  // Setup and cleanup
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    // Focus the body to ensure keyboard events are captured
    document.body.focus();
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  return {
    enabled,
    enable,
    disable,
    startResponseWindow,
    endResponseWindow,
    isInResponseWindow,
  };
}
