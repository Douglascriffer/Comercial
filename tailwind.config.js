/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ec6e2a',
          50:  '#FFF0E8',
          100: '#FFD9C2',
          200: '#FFB899',
          300: '#FF9666',
          400: '#FF7D3F',
          500: '#ec6e2a',
          600: '#E55A14',
          700: '#CC4A08',
          800: '#993800',
          900: '#662600',
        },
      },
      fontFamily: {
        sans: ['Syne', 'Gotham', 'sans-serif'],
        display: ['Syne', 'Gotham', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(236,110,42,0.12), 0 1px 3px rgba(0,0,0,0.06)',
        'brand': '0 4px 20px rgba(236,110,42,0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ec6e2a 0%, #f57e42 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #2d1a0e 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-brand': 'pulseBrand 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseBrand: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}
