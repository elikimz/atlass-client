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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      boxShadow: {
        'card': '0 8px 30px rgb(0,0,0,0.04)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
}
