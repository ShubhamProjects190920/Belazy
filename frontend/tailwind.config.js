/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Belazy Electric Blue — primary brand
        brand: {
          50:  "#eef3ff",
          100: "#dce5ff",
          200: "#bacbff",
          300: "#8da5ff",
          400: "#6680ff",
          500: "#4f7cff",
          600: "#2f5af7",
          700: "#2042e5",
          800: "#1b36c0",
          900: "#1a2f9a",
          950: "#121d5a",
        },
        // Dark surfaces
        dark: {
          DEFAULT: "#07071a",
          50:  "#0d0d1f",
          100: "#131326",
          200: "#191932",
          300: "#1f1f3d",
          400: "#262648",
        },
        // Purple / violet accent
        violet: {
          DEFAULT: "#8b5cf6",
          50:  "#f5f3ff",
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        // Cyan accent
        neon: {
          cyan:   "#22d3ee",
          blue:   "#4f7cff",
          purple: "#8b5cf6",
          green:  "#10b981",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-x":    "gradientX 5s ease infinite",
        "float":         "float 6s ease-in-out infinite",
        "float-slow":    "float 10s ease-in-out infinite",
        "glow-pulse":    "glowPulse 2.5s ease-in-out infinite alternate",
        "fade-in-up":    "fadeInUp 0.6s ease forwards",
        "slide-in":      "slideIn 0.4s ease forwards",
        "shimmer":       "shimmer 2.2s ease-in-out infinite",
        "orb-1":         "orb1 12s ease-in-out infinite",
        "orb-2":         "orb2 16s ease-in-out infinite",
        "orb-3":         "orb3 20s ease-in-out infinite",
        "spin-slow":     "spin 25s linear infinite",
        "count-up":      "fadeInUp 0.8s ease forwards",
        "border-glow":   "borderGlow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-14px)" },
        },
        glowPulse: {
          from: { boxShadow: "0 0 20px rgba(79,124,255,0.15)" },
          to:   { boxShadow: "0 0 60px rgba(79,124,255,0.45), 0 0 100px rgba(139,92,246,0.2)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        orb1: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%":      { transform: "translate(80px,-60px) scale(1.15)" },
          "66%":      { transform: "translate(-60px,80px) scale(0.9)" },
        },
        orb2: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%":      { transform: "translate(-100px,50px) scale(1.2)" },
          "66%":      { transform: "translate(60px,-80px) scale(0.85)" },
        },
        orb3: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%":      { transform: "translate(70px,70px) scale(1.1)" },
        },
        borderGlow: {
          from: { borderColor: "rgba(79,124,255,0.2)" },
          to:   { borderColor: "rgba(139,92,246,0.5)" },
        },
      },
      backgroundSize: {
        "200%": "200%",
        "300%": "300%",
      },
    },
  },
  plugins: [],
};
