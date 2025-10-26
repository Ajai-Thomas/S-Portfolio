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
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }