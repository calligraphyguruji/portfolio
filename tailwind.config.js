/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        compound: {
          canvas: '#FFFFFF',
          ink: '#171717',
          graphite: '#E5E7EB',
          vellum: '#F3F3F3',
          slate: '#6F6F6F',
          pewter: '#5E5E5E',
          ash: '#A0A0A0',
          carbon: '#222222',
          cream: '#FFE9BF',
          'cream-dark': '#2A241A',
        },
        canvas: {
          dark: '#0B0F17',
          light: '#FFFFFF',
        },
        surface: {
          dark: '#111827',
          'dark-elevated': '#162032',
          light: '#FFFFFF',
          'light-elevated': '#F3F3F3',
        },
        border: {
          dark: '#262626',
          'dark-subtle': 'rgba(255, 255, 255, 0.08)',
          light: '#E5E7EB',
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
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        'compound-preview':
          '0 1px 2px rgba(207,207,207,0.16), 0 4px 8px rgba(207,207,207,0.12), 0 12px 24px rgba(207,207,207,0.08), 0 24px 48px rgba(207,207,207,0.04)',
        'compound-preview-dark':
          '0 1px 3px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)',
        'glow-cyan': '0 0 20px -5px rgba(56, 189, 248, 0.25)',
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'subtle-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
