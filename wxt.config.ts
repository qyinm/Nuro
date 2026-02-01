import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Nuro - Dual N-Back Master',
    short_name: 'Nuro',
    description: 'Train your working memory with dual n-back cognitive exercises',
    version: '1.0.0',
    permissions: ['storage', 'alarms', 'notifications'],
    action: {
      default_title: 'Nuro - Dual N-Back Master',
      default_popup: 'popup.html',
    },
  },
});
