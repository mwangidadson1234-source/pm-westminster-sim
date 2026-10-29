export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14181c',
        slate: '#1d242b',
        paper: '#e8e2d0',
        brass: '#c9a24b',
        bench: '#3d7a5c',
        rust: '#c0583f',
      },
      fontFamily: {
        head: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
