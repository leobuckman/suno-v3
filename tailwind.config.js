/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink': '#1a1a1a',
        'muted': '#6b7280',
        'accent': '#e63946',
        suno: {
          pink: '#FF2D78',
          dark: '#0D0D0D',
          card: '#1A1A1A',
          muted: '#2A2A2A',
          text: '#A0A0A0',
        }
      },
      fontFamily: {
        'display': ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'body': ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'up': ['Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 45, 120, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 45, 120, 0.6)' },
        }
      },
      lineHeight: {
        'relaxed': '1.7',
      }
    },
  },
  plugins: [],
}
