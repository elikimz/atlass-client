/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5B5FFF",
        secondary: "#F5F5F5",
        dark: "#1A1A2E",
      }
    },
  },
  plugins: [],
}
