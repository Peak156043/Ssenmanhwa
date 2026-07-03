/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--ink-950)',
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
        },
        paper: {
          100: 'var(--paper-100)',
          200: 'var(--paper-200)',
          300: 'var(--paper-300)',
          400: 'var(--paper-400)',
          500: 'var(--paper-500)',
        },
        violet: {
          400: '#9b82ff',
          500: '#7c5cff',
          600: '#6440f0',
          700: '#4f2fd1',
        },
        amber: {
          400: '#f8b94a',
          500: '#f5a623',
          600: '#d6890f',
        },
        danger: {
          400: '#ef6a6e',
          500: '#e5484d',
          600: '#c5363b',
        },
      },
      fontFamily: {
        display: ['var(--font-archivo-black)', 'Arial Black', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(124,92,255,0.4), 0 0 24px rgba(124,92,255,0.25)',
      },
    },
  },
  plugins: [],
};
