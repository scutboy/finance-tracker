/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trackerGreen: '#3B6D11',
        trackerRed: '#A32D2D',
        trackerBlue: '#185FA5',
        trackerAmber: '#854F0B',
      }
    },
  },
  plugins: [],
}
