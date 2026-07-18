import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        airbnb: {
          DEFAULT: "#FF385C",
          dark: "#D70466",
          light: "#FF5A78",
          hover: "#E31C5F",
        },
        primary: "#FF385C",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          dark: "var(--color-border-dark)",
        },
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
      },
      fontFamily: {
        sans: ["Nunito Sans", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.08)",
        md: "0 4px 12px rgba(0,0,0,0.12)",
        lg: "0 6px 16px rgba(0,0,0,0.16)",
        xl: "0 12px 24px rgba(0,0,0,0.18)",
        card: "0 6px 16px rgba(0,0,0,0.12)",
        "card-hover": "0 6px 20px rgba(0,0,0,0.18)",
      },
      borderRadius: {
        pill: "9999px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        scaleUp: {
          from: { transform: "scale(0.96)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        slideIn: {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out forwards",
        scaleUp: "scaleUp 0.15s ease-out forwards",
        slideIn: "slideIn 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
