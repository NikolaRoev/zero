import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
    },
    // 3. to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    envDir: __dirname,
    root: resolve(__dirname, "src", "pages"),
    publicDir: resolve(__dirname, "public"),
    build: {
        emptyOutDir: true,
        //sourcemap: "inline",
        rollupOptions: {
            input: {
                "index": resolve(__dirname, "src", "pages", "index.html"),
            },
            output: {
                dir: resolve(__dirname, "dist"),
                //entryFileNames: "[name].js"
            }
        }
    }
}));
