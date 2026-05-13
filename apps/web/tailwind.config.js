/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "tech-dark": "#0a0a0c",
        "tech-gray": "#1a1a1e",
        "tech-accent": "#3b82f6", // Or something more industrial
        "industrial-gold": "#d4af37",
        "industrial-gray": "#4a4a4a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
