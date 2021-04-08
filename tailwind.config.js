module.exports = {
  purge: {
    content: [
      "./**/*.html",
      "./**/*.md",
      "./**/*.yml",
      "./**/*.handlebars",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-rtl"),
  ],
};
