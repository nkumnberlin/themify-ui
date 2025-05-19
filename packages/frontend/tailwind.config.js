import tokens from "./tokens.json";

module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
      fontSize: tokens.fontSizes,
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
