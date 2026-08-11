/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ee',
          100: '#f9edcd',
          200: '#f2d990',
          300: '#e8c057',
          400: '#D4A645',
          500: '#C9973A',
          600: '#A07828',
          700: '#7B5520',
          800: '#5C3D18',
          900: '#3D2810',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
