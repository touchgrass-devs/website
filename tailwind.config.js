/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'luxury-bg': '#f5f5f7',
        'luxury-card': '#ffffff',
        'luxury-border': 'rgba(0, 0, 0, 0.08)',
        'luxury-border-hover': 'rgba(0, 0, 0, 0.16)',

        sage: {
          50: '#fafafb',
          100: '#f4f5f6',
          200: '#e4e7e9',
          300: '#cbd1d6',
          400: '#9ca6af',
          500: '#6b7782',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },

        'gold-accent': '#c4a265',
        'grass-accent': '#2e4a3f',
        'grass-accent-light': '#446e5b',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
