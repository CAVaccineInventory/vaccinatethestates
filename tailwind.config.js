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
    extend: {
      keyframes: {
        'fade-in-down': {
            '0%': {
                opacity: '0',
                transform: 'translateY(-10px)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        },
        'fade-in-up': {
            '0%': {
                opacity: '0',
                transform: 'translateY(10px)'
            },
            '100%': {
                opacity: '1',
                transform: 'translateY(0)'
            },
        }
      },
      animation: {
          'fade-in-down': 'fade-in-down 0.5s ease-out',
          'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
    },
  },
  plugins: [
    require("tailwindcss-rtl"),
  ],
};
