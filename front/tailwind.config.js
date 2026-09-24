/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3a9b78',
          foreground: '#ffffff',
          hover: '#2d8063',
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
        },
        danger: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
};

