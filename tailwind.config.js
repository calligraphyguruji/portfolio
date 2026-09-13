/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          dark: '#0B0F17',
          light: '#F8FAFC',
        },
        surface: {
          dark: '#111827',
          'dark-elevated': '#162032',
          light: '#FFFFFF',
          'light-elevated': '#F1F5F9',
        },
        border: {
          dark: '#1E293B',
          'dark-subtle': 'rgba(255, 255, 255, 0.08)',
          light: '#E2E8F0',
          'light-subtle': 'rgba(0, 0, 0, 0.06)',
        },
        accent: {
          cyan: '#38BDF8',
          blue: '#3B82F6',
          indigo: '#6366F1',
          violet: '#818CF8',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
        cream: '#FAF9F6',
        charcoal: '#121212',
        taupe: '#7D7871',
        champagne: '#F7E7CE',
        'warm-glow': '#FFECCC',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Syne"', 'Plus Jakarta Sans', 'sans-serif'],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(56, 189, 248, 0.25)',
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'subtle-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
