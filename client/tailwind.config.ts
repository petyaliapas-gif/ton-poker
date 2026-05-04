import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Casino-style dark palette with TON-blue accents and a touch of gold.
        bg: '#0a0c11',
        surface: '#11141c',
        elevated: '#181c27',
        line: '#222633',
        fg: '#e9eaf3',
        muted: '#8d92a8',
        accent: {
          DEFAULT: '#3aa0ff', // TON blue
          dark: '#2078d4',
          glow: '#6ec1ff',
        },
        gold: {
          DEFAULT: '#f3c75f',
          dark: '#b3873b',
        },
        felt: {
          DEFAULT: '#0e3b2b',
          edge: '#0a2b20',
          rail: '#3a1d10',
          highlight: '#125b41',
        },
        chip: {
          white: '#f4f4ff',
          red: '#e94545',
          green: '#33c178',
          blue: '#3aa0ff',
          black: '#1f232f',
          purple: '#a155d8',
          gold: '#f3c75f',
        },
      },
      boxShadow: {
        'card': '0 4px 16px -4px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset',
        'glow-accent': '0 0 24px 0 rgba(58,160,255,0.5)',
        'glow-gold': '0 0 24px 0 rgba(243,199,95,0.45)',
        'felt-inner': 'inset 0 0 80px rgba(0,0,0,0.55)',
        'rail': 'inset 0 2px 0 rgba(255,255,255,0.06), inset 0 -8px 24px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'felt-radial': 'radial-gradient(ellipse at center, #135841 0%, #0e3b2b 50%, #0a2b20 100%)',
        'rail-grad': 'linear-gradient(180deg, #5a2c19 0%, #3a1d10 60%, #2c1408 100%)',
        'glow-accent': 'radial-gradient(circle at 50% 0%, rgba(58,160,255,0.20), transparent 60%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
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
      },
    },
  },
  plugins: [],
} satisfies Config;
