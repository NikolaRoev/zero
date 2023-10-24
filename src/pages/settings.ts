import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

await listen("closed-database", () => {
    appWindow.close().catch(async (reason) => {
        await invoke("error", {
            message: `Failed to close settings on database closed event: ${reason}.`
        });
    });
});
