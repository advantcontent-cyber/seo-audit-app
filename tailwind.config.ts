import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0b0b0b", secondary: "#52514e", muted: "#898781" },
        surface: { DEFAULT: "#fcfcfb", page: "#f9f9f7" },
        line: "#e1e0d9",
        brand: { DEFAULT: "#2a78d6", hover: "#1c5cab", subtle: "#cde2fb" },
        sidebar: { DEFAULT: "#0f1620", hover: "#182231", line: "#232e3f" },
        status: {
          good: "#0ca30c",
          warning: "#fab219",
          serious: "#ec835a",
          critical: "#d03b3b",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
