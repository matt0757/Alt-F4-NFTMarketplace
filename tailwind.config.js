/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float linear infinite',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: '0.1',
          },
          '50%': {
            opacity: '0.2',
          },
        },
        float: {
          '0%': {
            transform: 'translateY(100vh) translateX(0) rotate(0deg)',
          },
          '25%': {
            transform: 'translateY(50vh) translateX(25px) rotate(90deg)',
          },
          '50%': {
            transform: 'translateY(0vh) translateX(50px) rotate(180deg)',
          },
          '75%': {
            transform: 'translateY(-50vh) translateX(75px) rotate(270deg)',
          },
          '100%': {
            transform: 'translateY(-100vh) translateX(100px) rotate(360deg)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      colors: {
        gray: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#6a6a6a',
          400: '#9a9a9a',
          300: '#cacaca',
        },
      },
    },
  },
  plugins: [],
}
