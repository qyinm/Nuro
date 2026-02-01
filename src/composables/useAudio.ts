import { ref, onMounted } from 'vue';
import type { AudioState } from '../types/game';
import { VOICE_LOADING_TIMEOUT_MS } from '../utils/constants';
import { logger } from '../utils/logger';

export function useAudio() {
  const state = ref<AudioState>({
    available: false,
    selectedVoice: null,
    errorMessage: null,
  });

  const isReady = ref(false);

  /**
   * Initialize audio system and detect available voices
   */
  async function initialize(): Promise<void> {
    if (typeof speechSynthesis === 'undefined') {
      state.value.available = false;
      state.value.errorMessage = 'Speech synthesis not supported in this browser';
      return;
    }

    // Get voices - may need to wait for them to load
    let voices = speechSynthesis.getVoices();

    if (voices.length === 0) {
      // Wait for voices to load
      await new Promise<void>((resolve) => {
        const handler = () => {
          voices = speechSynthesis.getVoices();
          speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve();
        };
        speechSynthesis.addEventListener('voiceschanged', handler);

        // Timeout after 2 seconds
        setTimeout(() => {
          speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve();
        }, VOICE_LOADING_TIMEOUT_MS);
      });
    }

    voices = speechSynthesis.getVoices();

    if (voices.length === 0) {
      state.value.available = false;
      state.value.errorMessage = 'No speech voices available on this system';
      return;
    }

    // Select a voice - prefer English voices
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    state.value.selectedVoice = englishVoice || voices[0];
    state.value.available = true;
    state.value.errorMessage = null;

    // Pre-warm the TTS engine
    await prewarm();

    isReady.value = true;
  }

  /**
   * Pre-warm the TTS engine to reduce first-call latency
   */
  async function prewarm(): Promise<void> {
    if (!state.value.available) return;

    try {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      if (state.value.selectedVoice) {
        utterance.voice = state.value.selectedVoice;
      }
      speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore prewarm errors
    }
  }

  /**
   * Speak a letter
   */
  function speakLetter(letter: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!state.value.available) {
        resolve();  // Fail silently if not available
        return;
      }

      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        if (state.value.selectedVoice) {
          utterance.voice = state.value.selectedVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          logger.error('Speech error:', event.error);
          state.value.errorMessage = `Speech error: ${event.error}`;
          resolve();  // Don't reject, just continue
        };

        speechSynthesis.speak(utterance);
      } catch (e) {
        logger.error('Speech synthesis error:', e);
        state.value.errorMessage = 'Speech synthesis failed';
        resolve();  // Don't reject, just continue
      }
    });
  }

  /**
   * Stop any ongoing speech
   */
  function stop(): void {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  return {
    state,
    isReady,
    initialize,
    speakLetter,
    stop,
  };
}
