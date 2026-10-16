/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dream-pink': '#F6A9D2',
        'soft-rose': '#E887B7',
        'cloud-cream': '#FFF4F8',
        'lavender': '#C9B8FF',
        'mint': '#BFEBD8',
        'sky-blue': '#B9E5FF',
        'plum-ink': '#49354F',
      },
      fontFamily: {
        sans: ['Quicksand', 'Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        floatCloud: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(15px)' },
        }
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float-cloud': 'floatCloud 8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
