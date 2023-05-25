/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'amerigo': ['Amerigo BT', 'sans-serif'],
        'janna': ['Janna LT', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
