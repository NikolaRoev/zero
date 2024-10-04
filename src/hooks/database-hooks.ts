import * as api from "../data/api";
import * as event from "../data/events";
import { useEffect, useState } from "react";
import { type Event } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import useTauriEvent from "./tauri-event-hook";


export function useDatabase() {
    const [path, setPath] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        api.databasePath().then((value) => {
            setPath(value);
        }).catch(async (reason: unknown) => {
            await message(`${reason}`, { title: "Failed to get database path.", kind: "error" });
        }).finally(() => { setIsLoaded(true); });
    }, []);

    useTauriEvent(event.CLOSED_DATABASE_EVENT, () => {
        setPath(null);
    });

    useTauriEvent(event.OPENED_DATABASE_EVENT, (event: Event<string>) => {
        sessionStorage.clear();
        setPath(event.payload);
    });


    return { path, isLoaded };
}
