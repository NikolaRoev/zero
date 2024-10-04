import * as api from "../data/api";
import { type Event, type EventCallback, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

export default function useTauriEvent<T>(eventName: string, callback: EventCallback<T>) {
    useEffect(() => {
        const unlisten = listen<T>(eventName, (event: Event<T>) => {
            callback(event);
        }).catch((reason: unknown) => {
            api.error(`Failed to listen for Tauri event ${eventName}: ${reason}`);
        });

        return () => {
            unlisten.then((f) => { f?.(); }).catch((reason: unknown) => {
                api.error(`Failed to unlisten for Tauri event ${eventName}: ${reason}`);
            });
        };
    }, [eventName, callback]);
}
