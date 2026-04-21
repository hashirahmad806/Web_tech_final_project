/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        canvas: "#f6f3ec",
        card: "#fffdf8",
        accent: "#f97316",
        accentDark: "#c2410c",
        teal: "#0f766e",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        float: "0 20px 50px rgba(23, 32, 51, 0.12)",
      },
    },
  },
  plugins: [],
};
