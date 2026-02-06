/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0F14',
        surface: '#151C26',
        stroke: '#263041',
        text: '#E5E7EB',
        sub: '#A1A1AA',
        metal: '#C7CDD6',
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#60A5FA'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.35)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
