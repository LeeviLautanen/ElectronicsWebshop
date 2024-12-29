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
        primary: "#2C3E50", // Dark Blue-Gray
        light: "#F9FAFB", // Light Gray
      },
    },
  },
  plugins: [],
};
