import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Session } from '../types/game';
import { useStorage } from '../composables/useStorage';

export const useStatsStore = defineStore('stats', () => {
  const storage = useStorage();

  const sessions = ref<Session[]>([]);
  const isLoading = ref(false);

  // Computed stats
  const totalSessions = computed(() => sessions.value.length);

  const completedSessions = computed(() =>
    sessions.value.filter(s => s.completed)
  );

  const averageAccuracy = computed(() => {
    const completed = completedSessions.value;
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, s) => acc + s.combinedAccuracy, 0);
    return Math.round(sum / completed.length);
  });

  const averageReactionTime = computed(() => {
    const completed = completedSessions.value.filter(s => s.avgReactionTime > 0);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, s) => acc + s.avgReactionTime, 0);
    return Math.round(sum / completed.length);
  });

  const bestNLevel = computed(() => {
    if (sessions.value.length === 0) return 0;
    return Math.max(...sessions.value.map(s => s.nLevel));
  });

  const currentStreak = computed(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort sessions by date descending
    const sorted = [...sessions.value].sort((a, b) => b.timestamp - a.timestamp);

    for (const session of sorted) {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  });

  const totalTrainingTime = computed(() => {
    // Estimate: ~3 seconds per trial
    const totalTrials = sessions.value.reduce((acc, s) => acc + s.totalTrials, 0);
    return Math.round((totalTrials * 3) / 60);  // minutes
  });

  const accuracyByLevel = computed(() => {
    const byLevel: Record<number, { count: number; totalAccuracy: number }> = {};

    for (const session of completedSessions.value) {
      if (!byLevel[session.nLevel]) {
        byLevel[session.nLevel] = { count: 0, totalAccuracy: 0 };
      }
      byLevel[session.nLevel].count++;
      byLevel[session.nLevel].totalAccuracy += session.combinedAccuracy;
    }

    return Object.entries(byLevel).map(([level, data]) => ({
      level: parseInt(level),
      avgAccuracy: Math.round(data.totalAccuracy / data.count),
      sessionCount: data.count,
    })).sort((a, b) => a.level - b.level);
  });

  const recentSessions = computed(() => {
    return sessions.value.slice(0, 10);
  });

  const accuracyTrend = computed(() => {
    // Get last 30 sessions in chronological order
    const recent = [...sessions.value]
      .filter(s => s.completed)
      .slice(0, 30)
      .reverse();

    return recent.map(s => ({
      timestamp: s.timestamp,
      accuracy: s.combinedAccuracy,
      nLevel: s.nLevel,
    }));
  });

  // Actions
  async function loadSessions() {
    isLoading.value = true;
    try {
      sessions.value = await storage.getSessions();
    } finally {
      isLoading.value = false;
    }
  }

  async function addSession(session: Session) {
    await storage.saveSession(session);
    sessions.value.unshift(session);
  }

  async function clearAllStats() {
    await storage.clearAllData();
    sessions.value = [];
  }

  return {
    sessions,
    isLoading,
    totalSessions,
    completedSessions,
    averageAccuracy,
    averageReactionTime,
    bestNLevel,
    currentStreak,
    totalTrainingTime,
    accuracyByLevel,
    recentSessions,
    accuracyTrend,
    loadSessions,
    addSession,
    clearAllStats,
  };
});
