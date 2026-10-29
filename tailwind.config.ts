import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#07120c",
          900: "#0c1f14",
          800: "#143321",
          700: "#1d4930",
          600: "#2a6844",
          500: "#3a895c",
        },
        parchment: {
          50: "#fdfbf7",
          100: "#f7f1e3",
          200: "#ede0c4",
          300: "#dfc99b",
          400: "#cca968",
          500: "#b88c42",
        },
        moss: {
          400: "#84cc16",
          500: "#65a30d",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
