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
        gold: {
          light: '#F5E6C4',
          DEFAULT: '#D4AF37', // metallic gold
          dark: '#AA7C11',
          shimmer: '#FFDF00'
        },
        luxury: {
          cream: '#FAF6F0',   // soft beige
          beige: '#EFECE6',
          darkBg: '#121212',  // premium dark mode bg
          charcoal: '#1A1A1A',
          goldAccent: '#AA8C3B'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
