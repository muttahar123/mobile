/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#030712',    // bg-gray-950
          card: '#111827',    // bg-gray-900
          border: '#1f2937',  // border-gray-800
          primary: '#8b5cf6', // violet-500
          muted: '#9ca3af',   // text-gray-400
        }
      }
    },
  },
  plugins: [],
}
