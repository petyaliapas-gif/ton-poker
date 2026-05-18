import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#0f1117',
        surface: '#171923',
        elevated: '#1e2231',
        line: '#2a2f3e',
        fg: '#e8eaf0',
        muted: '#8b90a5',
        accent: {
          DEFAULT: '#6c5ce7',
          dark: '#5a4bd1',
          light: '#a29bfe',
          glow: '#b8b0ff',
        },
        green: {
          DEFAULT: '#00d68f',
          dark: '#00b377',
          light: '#33e0a5',
        },
        gold: {
          DEFAULT: '#ffc048',
          dark: '#e0a030',
        },
        rose: {
          DEFAULT: '#ff6b81',
          dark: '#e05070',
        },
      },
      boxShadow: {
        'card': '0 4px 24px -8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover': '0 8px 32px -8px rgba(108,92,231,0.3), 0 1px 0 rgba(255,255,255,0.06) inset',
        'glow-accent': '0 0 30px 0 rgba(108,92,231,0.4)',
        'glow-green': '0 0 24px 0 rgba(0,214,143,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(0,214,143,0.08) 50%, rgba(255,192,72,0.06) 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.04)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
