/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
      },
      colors: {
        primary: '#1e3a8a',
        secondary: '#dc2626',
        paper: '#fdfbf7',
      }
    },
  },
  plugins: [],
}