/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zenve: {
          green: '#002B1D',
          'green-dark': '#001C13',
          'green-light': '#073B2A',
          gold: '#E4BD5A',
          'gold-light': '#F1D27A',
          cream: '#F5F0DF',
          white: '#FFFFFF',
          muted: '#B8B9A8',
          border: 'rgba(228, 189, 90, 0.20)',
          'border-light': 'rgba(228, 189, 90, 0.35)',
          'card-bg': '#002217',
          'surface': '#003524',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        script: ['"Great Vibes"', '"Alex Brush"', 'cursive'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'luxury-gold': '0 0 25px -5px rgba(228, 189, 90, 0.25)',
        'card-soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'luxury-green': '0 12px 35px -8px rgba(7, 59, 42, 0.65), 0 0 24px 3px rgba(0, 43, 29, 0.45)',
        'green-inner': 'inset 0 0 70px 25px rgba(7, 59, 42, 0.75)',
      },
      letterSpacing: {
        'widest-luxury': '0.22em',
        'wider-luxury': '0.15em',
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
