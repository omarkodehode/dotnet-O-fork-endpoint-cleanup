/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
          600: '#4f46e5', // Indigo-600 (Main Brand Color)
          700: '#4338ca',
          900: '#312e81',
        },
        slate: {
          850: '#1e293b', // Custom Dark Sidebar
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}