/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{html,ts}"],
  theme: {
    extend: {
      screens: {
        sm: "768px",
        md: "980px",
        lg: "1200px",
      },
      maxWidth: {
        sm: "768px",
        md: "980px",
        lg: "1200px",
      },
      colors: {
        primary: "#2C3E50",
        light: "#F9FAFB",
        image: "#FCFCFC",
        greenAccent: "#42B169",
        greenAccentSelected: "#438C60",
        redAccent: "#D84B4B",
        redAccentSelected: "#3F7053",
      },
      borderColor: {
        lightCard: "#E5E7EB",
      },
    },
  },
  plugins: [],
};
