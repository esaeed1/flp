import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f2",
          100: "#dcece1",
          200: "#b9d9c4",
          300: "#8dc0a1",
          400: "#5da17c",
          500: "#3d8562",
          600: "#2c6c4e",
          700: "#255740",
          800: "#204636",
          900: "#1c3a2e",
          950: "#0d2019",
        },
      },
    },
  },
  plugins: [],
};
export default config;
