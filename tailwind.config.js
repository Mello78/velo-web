/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F0E0C',
        gold: '#C9A84C',
        cream: '#F5EDD6',
        dark: '#1A1814',
        border: '#2E2A22',
        muted: '#8A7E6A',
        green: '#7A9E7E',
        red: '#C4756A',
        blue: '#4A7AB8',
      },
    },
  },
  plugins: [],
}
