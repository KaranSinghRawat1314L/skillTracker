/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { 50:'#eef5ff', 100:'#d9e9ff', 200:'#bcd6ff', 400:'#5a99ff', 500:'#3574f0', 600:'#1f54e6', 700:'#1840d3', 800:'#1a36ab' },
        accent:  { 50:'#fff7ed', 100:'#ffedd5', 400:'#fb923c', 500:'#f97316', 600:'#ea6c0a' },
        surface: { 0:'#ffffff', 50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0' },
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                             to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
