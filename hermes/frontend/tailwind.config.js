/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Define your custom colors here using CSS variables
        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",
        "on-background": "var(--color-on-background)",
        background: {
          DEFAULT: "var(--color-background-default)",
          form: "var(--color-background-form)",
        },
        gradient: {
          start: "var(--color-gradient-start)",
          end: "var(--color-gradient-end)",
        },
        muted: "var(--color-text-muted)",
        icon: "var(--color-icon)",
      },
    },
  },
  plugins: [],
}

