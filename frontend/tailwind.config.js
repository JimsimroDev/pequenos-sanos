/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#4ade80',
          yellow: '#fbbf24',
          blue: '#60a5fa',
          orange: '#fb923c',
          purple: '#a78bfa',
        },
      },
      fontFamily: {
        game: ['"Comic Sans MS"', '"Chalkboard SE"', 'cursive'],
      },
    },
  },
  plugins: [],
}
