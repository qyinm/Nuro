import { ref } from 'vue';
import type { Session, Settings, InterruptedSession } from '../types/game';
import {
  DEFAULT_SETTINGS,
  MAX_SESSIONS_STORED,
  MAX_STORAGE_BYTES,
  TARGET_STORAGE_BYTES,
  SESSION_RECOVERY_TIMEOUT_MS,
} from '../utils/constants';

const STORAGE_KEYS = {
  SESSIONS: 'nback_sessions',
  SETTINGS: 'nback_settings',
  INTERRUPTED: 'nback_interrupted',
} as const;

export function useStorage() {
  const isLoading = ref(false);

  /**
   * Get all saved sessions
   */
  async function getSessions(): Promise<Session[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SESSIONS);
      return result[STORAGE_KEYS.SESSIONS] || [];
    } catch (e) {
      console.error('Failed to get sessions:', e);
      return [];
    }
  }

  /**
   * Save a new session
   */
  async function saveSession(session: Session): Promise<void> {
    try {
      const sessions = await getSessions();
      sessions.unshift(session);  // Add to beginning

      // Enforce max sessions limit
      if (sessions.length > MAX_SESSIONS_STORED) {
        sessions.splice(MAX_SESSIONS_STORED);
      }

      await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });

      // Check and cleanup storage if needed
      await cleanupStorageIfNeeded();
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }

  /**
   * Delete old sessions if storage exceeds limit
   */
  async function cleanupStorageIfNeeded(): Promise<void> {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();

      if (bytesInUse > MAX_STORAGE_BYTES) {
        const sessions = await getSessions();

        // Remove oldest sessions until under target
        while (sessions.length > 10) {
          sessions.pop();

          await chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });
          const newBytes = await chrome.storage.local.getBytesInUse();

          if (newBytes < TARGET_STORAGE_BYTES) break;
        }
      }
    } catch (e) {
      console.error('Failed to cleanup storage:', e);
    }
  }

  /**
   * Get user settings
   */
  async function getSettings(): Promise<Settings> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
    } catch (e) {
      console.error('Failed to get settings:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save user settings
   */
  async function saveSettings(settings: Partial<Settings>): Promise<void> {
    try {
      const current = await getSettings();
      const updated = { ...current, ...settings };
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  /**
   * Get interrupted session (if any)
   */
  async function getInterruptedSession(): Promise<InterruptedSession | null> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.INTERRUPTED);
      const interrupted = result[STORAGE_KEYS.INTERRUPTED] as InterruptedSession | undefined;

      if (!interrupted) return null;

      // Check if session is still recoverable (within timeout)
      const now = Date.now();
      if (now - interrupted.interruptedAt > SESSION_RECOVERY_TIMEOUT_MS) {
        // Too old, clear it
        await clearInterruptedSession();
        return null;
      }

      return interrupted;
    } catch (e) {
      console.error('Failed to get interrupted session:', e);
      return null;
    }
  }

  /**
   * Save interrupted session state
   */
  async function saveInterruptedSession(session: InterruptedSession): Promise<void> {
    try {
      await chrome.storage.local.set({ [STORAGE_KEYS.INTERRUPTED]: session });
    } catch (e) {
      console.error('Failed to save interrupted session:', e);
    }
  }

  /**
   * Clear interrupted session
   */
  async function clearInterruptedSession(): Promise<void> {
    try {
      await chrome.storage.local.remove(STORAGE_KEYS.INTERRUPTED);
    } catch (e) {
      console.error('Failed to clear interrupted session:', e);
    }
  }

  /**
   * Get storage usage info
   */
  async function getStorageInfo(): Promise<{ bytesInUse: number; sessionCount: number }> {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const sessions = await getSessions();
      return { bytesInUse, sessionCount: sessions.length };
    } catch (e) {
      return { bytesInUse: 0, sessionCount: 0 };
    }
  }

  /**
   * Clear all data
   */
  async function clearAllData(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (e) {
      console.error('Failed to clear data:', e);
    }
  }

  return {
    isLoading,
    getSessions,
    saveSession,
    getSettings,
    saveSettings,
    getInterruptedSession,
    saveInterruptedSession,
    clearInterruptedSession,
    getStorageInfo,
    clearAllData,
  };
}
