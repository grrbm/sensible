module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  plugins: [require("nightwind"), require("@tailwindcss/line-clamp")],
  theme: {
    extend: {
      transitionProperty: {
        height: "height",
        "max-height": "max-h",
        "min-height": "min-h",
      },
    },
  },
};
