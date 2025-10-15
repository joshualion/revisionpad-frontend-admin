/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // All your Vue + JS/TS components
  ],
  theme: {
    extend: {},
  },
  plugins: [
  'daisyui',
  ],
};
