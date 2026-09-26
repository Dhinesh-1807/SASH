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
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce2ff',
          300: '#8eccff',
          400: '#58adff',
          500: '#0084ff',
          600: '#0066ff', // Primary Electric Sapphire Blue
          700: '#004fd6',
          800: '#0040ad',
          900: '#063788',
          950: '#042258',
        },
        cyan: {
          brand: '#00C2FF', // Radiant Neon Cyan
        },
        surface: {
          dark: '#050811',
          card: '#0b1120',
          elevated: '#111a33',
          border: 'rgba(56, 189, 248, 0.12)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(0, 102, 255, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(0, 194, 255, 0.3)',
        'glow-subtle': '0 0 15px -3px rgba(0, 194, 255, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
