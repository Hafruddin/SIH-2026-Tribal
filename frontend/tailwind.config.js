/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tribal: {
          brown: '#8B4513',
          darkbrown: '#5C2E0B',
          lightbrown: '#A0522D',
          blue: '#006699',
          darkblue: '#004466',
          lightblue: '#E6F2F8',
          orange: '#E67E22',
          lightorange: '#FDF2E9',
          gold: '#D4AF37',
          bg: '#F8F9FA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Open Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
