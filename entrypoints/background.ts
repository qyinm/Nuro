export default defineBackground(() => {
  const ALARM_NAME = 'daily-reminder';
  const STORAGE_KEY = 'nback_settings';

  interface Settings {
    reminderEnabled: boolean;
    reminderTime: string;
    reminderDays: number[];
  }

  // Listen for alarm
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      checkAndShowNotification();
    }
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      const newSettings = changes[STORAGE_KEY].newValue as Settings;
      updateAlarm(newSettings);
    }
  });

  // Listen for notification click
  chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === 'nback-reminder') {
      // Open the popup
      chrome.action.openPopup?.();
    }
  });

  // Check settings and show notification if appropriate
  async function checkAndShowNotification() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const settings = result[STORAGE_KEY] as Settings | undefined;

      if (!settings?.reminderEnabled) return;

      // Check if today is a reminder day
      const today = new Date().getDay();
      if (!settings.reminderDays.includes(today)) return;

      // Show notification
      chrome.notifications.create('nback-reminder', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon/128.png'),
        title: 'Time to Train!',
        message: 'Keep your brain sharp with a quick Dual N-Back session.',
        priority: 2,
      });
    } catch (e) {
      console.error('Failed to show notification:', e);
    }
  }

  // Update or clear the alarm based on settings
  async function updateAlarm(settings: Settings) {
    // Clear existing alarm
    await chrome.alarms.clear(ALARM_NAME);

    if (!settings.reminderEnabled) return;

    // Parse reminder time
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);

    // Calculate next alarm time
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    // Create daily repeating alarm
    chrome.alarms.create(ALARM_NAME, {
      when: alarmTime.getTime(),
      periodInMinutes: 24 * 60, // Repeat daily
    });
  }

  // Initialize: check for existing settings and set up alarm
  async function initialize() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const settings = result[STORAGE_KEY] as Settings | undefined;

      if (settings) {
        await updateAlarm(settings);
      }
    } catch (e) {
      console.error('Failed to initialize background:', e);
    }
  }

  initialize();
});
