export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06060c',
          900: '#0b0b16',
          800: '#121226',
          700: '#1b1b3a',
          600: '#282854',
          500: '#4b4b88',
          400: '#8a8ab8',
          300: '#c4c4e0',
        },
        primary: {
          light: '#60a5fa',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
        secondary: {
          light: '#34d399',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        accent: {
          fuchsia: '#d946ef',
          violet: '#8b5cf6',
          amber: '#f59e0b',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-secondary': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-fuchsia': '0 0 20px rgba(217, 70, 239, 0.35)',
      }
    },
  },
  plugins: [],
}
