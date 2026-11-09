import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0070ba",
          dark: "#003087",
          light: "#e8f1fb",
        },
      },
    },
  },
  plugins: [],
};

export default config;
