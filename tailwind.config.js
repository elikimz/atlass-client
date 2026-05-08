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
          DEFAULT: "#5B5FFF",
          hover: "#4A4ED9",
        },
        sidebar: {
          DEFAULT: "#0B1120",
          hover: "#1E293B",
          active: "#1E293B",
        },
        background: "#F8FAFC",
        card: "#FFFFFF",
        text: {
          primary: "#0F1729",
          secondary: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
