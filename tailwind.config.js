/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{vue,ts,tsx}',
    './components/**/*.{vue,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#242424',
        'bg-tertiary': '#2e2e2e',
        // Text
        'text-primary': '#f5f5f5',
        'text-secondary': '#a0a0a0',
        'text-tertiary': '#666666',
        // Accents
        'accent-light': '#ffffff',
        'accent-subtle': '#404040',
        // Feedback
        'correct': '#4ade80',
        'incorrect': '#f87171',
        'warning': '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
