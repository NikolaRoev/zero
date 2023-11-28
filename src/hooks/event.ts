import * as api from "../data/api";
import { type EventCallback, type UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export default function useEvent(eventName: string, handler: EventCallback<unknown>) {
    useEffect(() => {
        const unlisten = listen(eventName, (event) => {
            handler(event);
        }).catch((reason) => {
            api.error(`Failed to listen for '${eventName}': ${reason}`);
        });
    
        return () => {
            unlisten.then((f: UnlistenFn) => { f(); }).catch((reason) => {
                api.error(`Failed to unlisten for '${eventName}': ${reason}`);
            });
        };
    }, []);
}
