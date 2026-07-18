/** @type {import('tailwindcss').Config} */
function withVar(name) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // navy/cream are theme-aware: their CSS variables flip between
        // :root and :root.dark (see src/styles/index.css), so every
        // existing text-navy-*/bg-cream-* usage adapts to dark mode for
        // free. brand/onbrand are deliberately NOT theme-aware: they're
        // the fixed solid-fill button/active-nav pairing that should look
        // the same dark-navy-with-white-text in both themes.
        navy: {
          DEFAULT: withVar("--navy-700"),
          50: withVar("--navy-50"),
          100: withVar("--navy-100"),
          400: withVar("--navy-400"),
          600: withVar("--navy-600"),
          700: withVar("--navy-700"),
          900: withVar("--navy-900"),
        },
        cream: {
          DEFAULT: withVar("--cream"),
          100: withVar("--cream-100"),
          200: withVar("--cream-200"),
        },
        sage: {
          DEFAULT: "#5B8A72",
          100: withVar("--sage-100"),
          600: "#456B58",
        },
        urgent: {
          emergency: "#B3462C",
          soon: "#C08A2E",
          home: "#4C8062",
        },
        brand: "#12293D",
        onbrand: "#FFFFFF",
      },
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,41,61,0.06), 0 4px 16px rgba(18,41,61,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
