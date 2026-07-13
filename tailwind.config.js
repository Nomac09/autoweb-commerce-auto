/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        anthracite: "#0E0E10",
        surface: "#16171A",
        bone: "#F5F2EC",
        muted: "#8A8A8F",
        oxblood: "#6B0F1A",
        hairline: "#2A2A2E",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
