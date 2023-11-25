import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";



export default defineConfig(() => ({
    plugins: [
        react()
    ],
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true
    },
    envPrefix: ["VITE_", "TAURI_"],
    envDir: __dirname,
    root: resolve(__dirname, "src"),
    publicDir: resolve(__dirname, "public"),
    build: {
        target: "ESNext",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                "index": resolve(__dirname, "src", "index.html"),
                "settings": resolve(__dirname, "src", "settings.html")
            },
            output: {
                dir: resolve(__dirname, "dist")
            }
        }
    }
}));
