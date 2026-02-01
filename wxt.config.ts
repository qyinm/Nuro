import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Dual N-Back',
    description: 'Train your working memory with dual n-back cognitive exercises',
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'notifications'],
    action: {
      default_title: 'Dual N-Back',
      default_popup: 'popup.html',
    },
  },
});
