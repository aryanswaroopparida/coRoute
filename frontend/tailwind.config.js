/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 THIS is the key line
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
