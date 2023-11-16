import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx}"
    ],
    theme: {
        colors: {
            "primary": "#fafafa",
            "secondary": "#f0f0f0",
            "border": "#646464",
            "light-gray": "#dcdcdc",
            "gray": "#b0b0b0",
            "dark-gray": "#9a9a9a",
            "valid": "#00ed18a5",
            "invalid": "#ed0000a5"
        }
    },
    plugins: []
} satisfies Config;
