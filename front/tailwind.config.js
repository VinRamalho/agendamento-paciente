/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#167d9a',
          foreground: '#ffffff',
          hover: '#12677f',
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
