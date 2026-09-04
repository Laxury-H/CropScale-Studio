/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#0c0d0e',
          900: '#141618',
          850: '#1a1d20',
          800: '#22262b',
          700: '#32373f',
          600: '#484f5a',
          500: '#656e7d',
          400: '#8e98a8',
          300: '#b8c1ce',
          200: '#e2e7ef',
          100: '#f1f4f8',
        },
        accent: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
