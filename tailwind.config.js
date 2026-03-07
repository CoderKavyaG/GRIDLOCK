/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'accent': '#e8ff47',
        'accent-red': '#ff4757',
        'accent-green': '#2ed573',
        'accent-yellow': '#ffa502',
        'accent-purple': '#a855f7',
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-card': '#161616',
        'bg-hover': '#1e1e1e',
        'text-primary': '#f0f0f0',
        'text-muted': '#777777',
        'border-base': '#222222',
        'border-hover': '#3a3a3a',
      }
    },
  },
  plugins: [],
}
