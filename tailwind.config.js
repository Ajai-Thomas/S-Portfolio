/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // Scans all your component files
    ],
    theme: {
      extend: {
        colors: {
          'antique-white': '#F4F0DB',
          'ivory': '#FFFAF1',
          'beige': '#ECD9BA',
          'tan': '#DEC19B',
        },
        fontFamily: {
          // Use Manrope for the default sans font (cleaner)
          sans: ['Manrope', 'sans-serif'],
          // Use Syne for specific display text (aesthetic)
          display: ['Syne', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }