import * as api from "../data/api";
import { type UnlistenFn, listen } from "@tauri-apps/api/event";
import type { UpdateWork, Work } from "../data/api";
import { useEffect, useState } from "react";



export function useUpdateWorks() {
    const [updateWorks, setUpdateWorks] = useState<UpdateWork[]>([]);

    function getUpdateWorks() {
        api.getUpdateWorks().then((value) => {
            setUpdateWorks(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getUpdateWorks();
    }, []);

    useEffect(() => {
        const unlisten = listen(api.REFRESH_UPDATE_WORKS_EVENT, () => {
            getUpdateWorks();
        }).catch(async (reason) => {
            await api.error(`Failed to listen for '${api.REFRESH_UPDATE_WORKS_EVENT}': ${reason}`);
        });
    
        return () => {
            unlisten.then((f: UnlistenFn) => { f(); }).catch(async (reason) => {
                await api.error(`Failed to unlisten for '${api.REFRESH_UPDATE_WORKS_EVENT}': ${reason}`);
            });
        };
    }, []);

    return { updateWorks, setUpdateWorks, getUpdateWorks };
}

export function useWorks() {
    const [works, setWorks] = useState<Work[]>([]);

    function getWorks() {
        api.getWorks().then((value) => {
            setWorks(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getWorks();
    }, []);

    useEffect(() => {
        const unlisten = listen(api.REFRESH_WORKS_EVENT, () => {
            getWorks();
        }).catch(async (reason) => {
            await api.error(`Failed to listen for '${api.REFRESH_WORKS_EVENT}': ${reason}`);
        });
    
        return () => {
            unlisten.then((f: UnlistenFn) => { f(); }).catch(async (reason) => {
                await api.error(`Failed to unlisten for '${api.REFRESH_WORKS_EVENT}': ${reason}`);
            });
        };
    }, []);

    return { works, setWorks, getWorks };
}
