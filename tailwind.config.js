/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        400: '400',
        500: '500',
        600: '600',
        700: '700',
        900: '900',
      },
      colors: {
        brand: {
          white: '#FFFFFF',
          gray: '#EFEFEE',
          charcoal: '#A3A3A3',
          space: '#464646',
          black: '#2E2E30',
          sky: '#53C9EE',
          purple: '#5E1EB9',
          lightPurple: '#F8F4FF',
          softPurple: '#EEE1FF',
          blue: '#403EC6',
          pink: '#E01C8F',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #53C9EE 0%, #5E1EB9 100%)',
        'brand-gradient-r': 'linear-gradient(135deg, #5E1EB9 0%, #53C9EE 100%)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
