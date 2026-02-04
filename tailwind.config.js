/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5e6ff',
          100: '#e6ccff',
          200: '#cc99ff',
          300: '#b366ff',
          400: '#9933ff',
          500: '#6B21A8', // Main purple
          600: '#5a1b8f',
          700: '#4a1676',
          800: '#39105c',
          900: '#280b43',
        },
        gold: {
          50: '#fdf9e6',
          100: '#faf3cc',
          200: '#f5e799',
          300: '#f0db66',
          400: '#ebcf33',
          500: '#D4AF37', // Main gold
          600: '#b3942f',
          700: '#927926',
          800: '#705e1d',
          900: '#4f4214',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
