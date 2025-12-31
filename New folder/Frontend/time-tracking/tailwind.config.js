/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Indigo-500
          600: '#4f46e5', // Indigo-600
          700: '#4338ca', // Indigo-700
        },
        surface: '#f8fafc', // Slate-50 background
      }
    },
  },
  plugins: [],
}