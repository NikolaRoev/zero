import { type Event, type EventCallback, listen } from "@tauri-apps/api/event";
import { error } from "tauri-plugin-log-api";
import { useEffect } from "react";

export default function useTauriEvent<T>(eventName: string, callback: EventCallback<T>) {
    useEffect(() => {
        const unlisten = listen(eventName, (event: Event<T>) => {
            callback(event);
        }).catch((reason) => {
            error(`Failed to listen for Tauri event ${eventName}: ${reason}`);
        });

        return () => {
            unlisten.then((f) => { f?.(); }).catch((reason) => {
                error(`Failed to unlisten for Tauri event ${eventName}: ${reason}`);
            });
        };
    }, [eventName, callback]);
}
