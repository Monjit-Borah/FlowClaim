import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f10",
        foreground: "#f5f3ef",
        panel: "#121213",
        panelAlt: "#171719",
        border: "#f2eee7",
        muted: "#b6aea1",
        highlight: "#ff6f61",
        highlightSoft: "#2a1715",
        success: "#8fe388",
        danger: "#ff8d84"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 0 0 rgba(0,0,0,0)",
        card: "0 0 0 rgba(0,0,0,0)"
      },
      backgroundImage: {
        mesh:
          "linear-gradient(90deg, transparent 0%, transparent 32%, rgba(255,111,97,0.7) 32.2%, transparent 32.4%, transparent 67%, rgba(255,111,97,0.7) 67.2%, transparent 67.4%, transparent 100%)"
      },
      fontFamily: {
        sans: ["Chalkboard SE", "Comic Sans MS", "Marker Felt", "Bradley Hand", "Segoe Print", "cursive"]
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
