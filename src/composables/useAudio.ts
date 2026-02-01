import { ref, readonly } from 'vue';
import type { AudioState } from '../types/game';
import { AUDIO_LETTERS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Audio composable using pre-recorded WAV files
 * Provides consistent, high-quality audio across all browsers
 */
export function useAudio() {
  const state = ref<AudioState>({
    available: false,
    selectedVoice: null,
    errorMessage: null,
  });

  const isReady = ref(false);

  // Audio cache for preloaded sounds
  const audioCache = new Map<string, HTMLAudioElement>();

  // Currently playing audio
  let currentAudio: HTMLAudioElement | null = null;

  /**
   * Initialize audio by preloading all letter sounds
   */
  async function initialize(): Promise<void> {
    try {
      // Preload all audio files
      const loadPromises = AUDIO_LETTERS.map(async (letter) => {
        const audio = new Audio(chrome.runtime.getURL(`audio/${letter}.wav`));
        audio.preload = 'auto';

        return new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            audioCache.set(letter, audio);
            resolve();
          }, { once: true });

          audio.addEventListener('error', () => {
            reject(new Error(`Failed to load audio for letter ${letter}`));
          }, { once: true });

          // Start loading
          audio.load();
        });
      });

      await Promise.all(loadPromises);

      state.value = {
        available: true,
        selectedVoice: null,
        errorMessage: null,
      };
      isReady.value = true;
    } catch (error) {
      logger.error('Failed to initialize audio:', error);
      state.value = {
        available: false,
        selectedVoice: null,
        errorMessage: 'Failed to load audio files',
      };
      isReady.value = false;
    }
  }

  /**
   * Play the audio for a specific letter
   */
  function speakLetter(letter: string): void {
    if (!isReady.value) {
      logger.error('Audio not ready');
      return;
    }

    const upperLetter = letter.toUpperCase();
    const cachedAudio = audioCache.get(upperLetter);

    if (!cachedAudio) {
      logger.error(`No audio found for letter: ${upperLetter}`);
      return;
    }

    // Stop any currently playing audio
    stop();

    // Clone the audio element to allow overlapping plays
    currentAudio = cachedAudio.cloneNode() as HTMLAudioElement;
    currentAudio.play().catch((error) => {
      logger.error('Failed to play audio:', error);
    });
  }

  /**
   * Stop any currently playing audio
   */
  function stop(): void {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  return {
    state: readonly(state),
    isReady: readonly(isReady),
    initialize,
    speakLetter,
    stop,
  };
}
