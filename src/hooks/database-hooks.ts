import * as api from "../data/api";
import * as event from "../data/events";
import { useEffect, useState } from "react";
import { type Event } from "@tauri-apps/api/event";
import { error } from "tauri-plugin-log-api";
import { message } from "@tauri-apps/api/dialog";
import useTauriEvent from "./tauri-event-hook";


export function useDatabase() {
    const [path, setPath] = useState<string | null>(null);


    useEffect(() => {
        api.databasePath().then((value) => {
            setPath(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get database path.", type: "error" });
        });
    }, []);

    useTauriEvent(event.CLOSED_DATABASE_EVENT, () => {
        setPath(null);
    });

    useTauriEvent(event.OPENED_DATABASE_EVENT, (event: Event<string>) => {
        sessionStorage.clear();
        setPath(event.payload);
    });


    return { path };
}


export function useRecentDatabases() {
    const [recentDatabases, setRecentDatabases] = useState<string[]>([]);


    function getRecentDatabases() {
        api.getRecentDatabases().then((value) => {
            setRecentDatabases(value);
        }).catch((reason) => {
            error(`Failed to get recent databases: ${reason}`);
        });
    }


    useEffect(() => {
        getRecentDatabases();
    }, []);

    useTauriEvent(event.CHANGE_RECENT_DATABASES_EVENT, () => {
        getRecentDatabases();
    });


    return { recentDatabases };
}
