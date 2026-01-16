/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e293b',
        success: '#10b981',
        danger: '#dc2626',
        warning: '#f59e0b',
        info: '#0ea5e9',
      },
      spacing: {
        '60px': '60px',
      },
    },
  },
  plugins: [],
}
