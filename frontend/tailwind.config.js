/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7047EB',
          deep: '#5526CC',
          lavender: '#F3EFFF',
          bg: '#F8F7FF',
          dark: '#17152F',
          turquoise: '#35C6C0',
          success: '#22C55E',
          warning: '#F59E0B',
          lightPurple: '#8E68FD',
          softPurple: '#EAE3FD',
          cardBorder: '#ECEAF7',
          mutedText: '#6A6783',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(112, 71, 235, 0.08)',
        'card': '0 10px 30px -4px rgba(23, 21, 47, 0.06)',
        'glow': '0 0 25px rgba(112, 71, 235, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
