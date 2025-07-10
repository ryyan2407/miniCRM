/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(0, 255, 0, 0.7)' },
          '50%': { boxShadow: '0 0 10px rgba(0, 255, 0, 1)' },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.5s infinite alternate',
      },
    },
  },
  plugins: [],
}