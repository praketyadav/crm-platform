/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1A1A24',
          elevated: '#22222F',
          dark: '#0F0F14',
        },
        primary: {
          DEFAULT: '#6C63FF',
          hover: '#7B74FF',
          glow: 'rgba(108, 99, 255, 0.3)',
        },
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        border: '#2A2A3E',
        'text-primary': '#F1F1F5',
        'text-secondary': '#8B8B9E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
