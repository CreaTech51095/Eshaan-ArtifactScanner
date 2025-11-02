/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3f0',
          100: '#e8e0d8',
          200: '#d1c2b0',
          300: '#b8a388',
          400: '#9d8560',
          500: '#765c46ff',
          600: '#5a4535ff',
          700: '#453528',
          800: '#30261c',
          900: '#1b1610',
        },
        secondary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        archaeological: {
          parchment: '#F8F4F0',
          cream: '#FEFCF9',
          warmGray: '#F5F1ED',
          accentBrown: '#8B4513',
          lightBrown: '#E8D5C4',
          darkBrown: '#1A1A1A',
          charcoal: '#2C2C2C',
          gold: '#D4AF37',
          olive: '#7A9B76',
          sage: '#9CAF88',
          terracotta: '#B85450',
          teal: '#7FB3D3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #F8F4F0 0%, #F5F1ED 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,244,240,0.9) 100%)',
      },
      boxShadow: {
        'archaeological-sm': '0 4px 6px -1px rgba(139, 69, 19, 0.1), 0 2px 4px -1px rgba(139, 69, 19, 0.06)',
        'archaeological': '0 10px 15px -3px rgba(139, 69, 19, 0.1), 0 4px 6px -2px rgba(139, 69, 19, 0.05)',
        'archaeological-lg': '0 20px 25px -5px rgba(139, 69, 19, 0.1), 0 10px 10px -5px rgba(139, 69, 19, 0.04)',
      },
    },
  },
  plugins: [],
}
