module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      colors: {
        temple: {
          50: '#fef7ff',
          500: '#aa3bff',
          600: '#8b1fff',
        }
      }
    },
  },
  plugins: [],
}
