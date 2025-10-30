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
        // thirdweb brand colors
        "tw-primary": "#CF1F8D",
        "tw-primary-hover": "#E11FBA",
        "tw-secondary": "#7000FF",
        "tw-accent": "#00D4FF",
        
        // Background colors
        background: "#0a0a0a",
        foreground: "#ededed",
        card: "#1a1a1a",
        modal: "#1a1a1a",
        
        // UI colors
        border: "rgba(255, 255, 255, 0.08)",
        "secondary-bg": "rgba(255, 255, 255, 0.05)",
        "secondary-hover": "rgba(255, 255, 255, 0.08)",
        "tertiary-bg": "rgba(255, 255, 255, 0.03)",
        
        // Text colors
        "primary-text": "#ffffff",
        "secondary-text": "rgba(255, 255, 255, 0.6)",
        "accent-text": "#CF1F8D",
        
        // Status colors
        success: "#00D395",
        danger: "#E74C3C",
        warning: "#F39C12",
        
        // Input
        "input-bg": "rgba(255, 255, 255, 0.05)",
        "input-border": "rgba(255, 255, 255, 0.12)",
        
        // Skeleton & loading
        skeleton: "rgba(255, 255, 255, 0.08)",
        scrollbar: "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "tw-gradient": "linear-gradient(135deg, #1a0a2e 0%, #0a0a0a 100%)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
