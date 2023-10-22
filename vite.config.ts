import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(() => ({
    clearScreen: false,
    server: {
        port: 1420,
        strictPort: true
    },
    envPrefix: ["VITE_", "TAURI_"],
    envDir: __dirname,
    root: resolve(__dirname, "src", "pages"),
    publicDir: resolve(__dirname, "public"),
    build: {
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                "index": resolve(__dirname, "src", "pages", "index.html"),
                "settings": resolve(__dirname, "src", "pages", "settings.html")
            },
            output: {
                dir: resolve(__dirname, "dist")
            }
        }
    }
}));
