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
          from: {
            transform: 'translateY(100vh) translateX(0)',
          },
          to: {
            transform: 'translateY(-100vh) translateX(100px)',
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
