/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#31566D",
          hover: "#244558",
          soft: "#E7EFF3",
        },
        accent: {
          DEFAULT: "#8C5D3D",
          soft: "#E8D6C2",
        },
        sidebar: {
          DEFAULT: "#1D3341",
          hover: "#284454",
          active: "#31566D",
        },
        background: "#F4F6F5",
        card: "#FFFFFF",
        text: {
          primary: "#1D2931",
          secondary: "#50616A",
          muted: "#5F7078",
        },
        success: "#2F6A55",
        warning: "#7C5A30",
        danger: "#984A4F",
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(23,43,56,0.055)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
}
