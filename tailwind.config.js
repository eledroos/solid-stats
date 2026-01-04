/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        'primary-darker': '#1E40AF',
        'primary-light': '#93C5FD',
        'primary-lighter': '#DBEAFE',
        'primary-lightest': '#EFF6FF',
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px rgba(0,0,0,1)',
        'brutal-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'brutal-xl': '12px 12px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-xs': '2px 2px 0px 0px rgba(0,0,0,1)',
        // Dark mode brutal shadows
        'brutal-dark': '6px 6px 0px 0px rgba(59,130,246,0.5)',
        'brutal-lg-dark': '8px 8px 0px 0px rgba(59,130,246,0.5)',
        'brutal-xl-dark': '12px 12px 0px 0px rgba(59,130,246,0.5)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-in-up': 'slide-in-up 0.4s ease-out forwards',
        'fill-bar': 'fill-bar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-enter': 'spin-enter 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        // Playful animations
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'count-up 0.4s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pop': 'pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.8)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fill-bar': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0)' },
        },
        'spin-enter': {
          'from': { transform: 'rotate(-90deg) scale(0)', opacity: '0' },
          'to': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        // Playful keyframes
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(20px)' },
          '50%': { transform: 'scale(1.05) translateY(-5px)' },
          '70%': { transform: 'scale(0.95) translateY(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'count-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '60%': { transform: 'translateX(5px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
