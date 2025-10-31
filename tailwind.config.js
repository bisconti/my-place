/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // src 폴더 내 .html, .js, .jsx, .ts, .tsx 스캔
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
