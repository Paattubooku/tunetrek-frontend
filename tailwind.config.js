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
                primary: "#3b82f6",
                "background-light": "#f1f5f9",
                "background-dark": "#0a0a0a",
                "glass-dark": "rgba(30, 30, 30, 0.45)",
                "glass-light": "rgba(255, 255, 255, 0.6)",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1.25rem",
                "xl": "1.75rem",
                "2xl": "2.5rem",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
