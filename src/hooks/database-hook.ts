import * as api from "../data/api";
import * as e from "../data/events";
import {  type Event, type UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";



export function useDatabasePath() {
    const [path, setPath] = useState<string | null>(null);

    useEffect(() => {
        api.databasePath().then((value) => {
            setPath(value);
        }).catch((reason) => { alert(reason); });

        const closedUnlisten = listen(e.CLOSED_DATABASE_EVENT, () => {
            setPath(null);
        }).catch((reason) => {
            api.error(`Failed to listen for database closed event: ${reason}`);
        });
        
        const openUnlisten = listen(e.OPENED_DATABASE_EVENT, (event: Event<string>) => {
            sessionStorage.clear();
            setPath(event.payload);
        }).catch((reason) => {
            api.error(`Failed to listen for database opened event: ${reason}`);
        });

        return () => {
            closedUnlisten.then((f: UnlistenFn) => { f(); }).catch((reason) => {
                api.error(`Failed to unlisten for database closed event ${reason}`);
            });

            openUnlisten.then((f: UnlistenFn) => { f(); }).catch((reason) => {
                api.error(`Failed to unlisten for database opened event: ${reason}`);
            });
        };
    }, []);

    return { path };
}


export function useRecentDatabases() {
    const [recentDatabases, setRecentDatabases] = useState<string[]>([]);

    useEffect(() => {
        api.getRecentDatabases().then((value) => {
            setRecentDatabases(value);
        }).catch((reason) => {
            api.error(`Failed to get recent databases: ${reason}`);
        });
    }, []);

    return { recentDatabases, setRecentDatabases };
}
