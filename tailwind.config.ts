import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#eef5ff",
          100: "#dce9ff",
          200: "#bed3ff",
          300: "#8eb3ff",
          400: "#5588f5",
          500: "#245de2",
          600: "#173fb7",
          700: "#12308c",
          800: "#102969",
          900: "#0d224e",
        },
        gold: {
          50: "#fff9e6",
          100: "#fff0bf",
          200: "#ffe48a",
          300: "#f5cf4a",
          400: "#ddb20f",
          500: "#c59400",
          600: "#9e7300",
          700: "#7b5a00",
        },
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
