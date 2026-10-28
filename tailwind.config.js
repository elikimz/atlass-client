/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#18D2C5",
          hover: "#3D9CFF",
          soft: "rgba(42, 113, 221, 0.20)",
        },
        accent: {
          DEFAULT: "#9755E9",
          soft: "#15E5C9",
        },
        sidebar: {
          DEFAULT: "#061522",
          hover: "#102A44",
          active: "#215CC0",
        },
        background: "#05121B",
        subtle: "#0F1D38",
        card: "#0B192B",
        text: {
          primary: "#F3F7FF",
          secondary: "#C0CEE3",
          muted: "#9CB0C8",
        },
        success: "#65D9A1",
        warning: "#FFD27A",
        danger: "#FF788C",
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 48px rgba(0,5,16,0.34)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}
