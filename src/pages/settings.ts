import { appWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

await listen("closed-database", () => {
    //TODO: Add the backend logging.
    appWindow.close().catch((reason) => { console.error(`Failed to close window ${reason}.`); });
});
