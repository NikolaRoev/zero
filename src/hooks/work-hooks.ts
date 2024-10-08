import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Work } from "../data/data";
import { message } from "@tauri-apps/plugin-dialog";



export function useWorks() {
    const [works, setWorks] = useState<Map<number, Work>>(new Map());


    function getWork(id: number) {
        const work = works.get(id);
        if (!work) {
            const message = `Missing Work [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return work;
    }

    function getWorks() {
        api.getWorks().then((value) => {
            setWorks(new Map(value.map((v) => [v.id, v])));
        }).catch(async (reason: unknown) => {
            await message(`${reason}`, { title: "Failed to get Works.", kind: "error" });
        });
    }

    function updateWorkName(id: number, name: string) {
        const work = getWork(id);
        works.set(id, { ...work, name: name });
        setWorks(new Map(works));

        api.updateWorkName(id, name).catch(async (reason: unknown) => {
            getWorks();
            await message(`${reason}`, { title: "Failed to update Work Name.", kind: "error" });
        });
    }

    function updateWorkProgress(id: number, progress: string) {
        const work = getWork(id);
        const timestamp = Date.now();
        works.set(id, { ...work, progress: progress, updated: timestamp });
        setWorks(new Map(works));

        api.updateWorkProgress(id, progress, timestamp).catch(async (reason: unknown) => {
            getWorks();
            await message(`${reason}`, { title: "Failed to update Work Progress.", kind: "error" });
        });
    }
    
    function updateWorkStatus(id: number, status: number) {
        const work = getWork(id);
        const timestamp = Date.now();
        works.set(id, { ...work, status: status, updated: timestamp });
        setWorks(new Map(works));

        api.updateWorkStatus(id, status, timestamp).catch(async (reason: unknown) => {
            getWorks();
            await message(`${reason}`, { title: "Failed to update Work Status.", kind: "error" });
        });
    }

    function updateWorkType(id: number, type: number) {
        const work = getWork(id);
        works.set(id, { ...work, type: type });
        setWorks(new Map(works));

        api.updateWorkType(id, type).catch(async (reason: unknown) => {
            getWorks();
            await message(`${reason}`, { title: "Failed to update Work Type.", kind: "error" });
        });
    }

    function updateWorkFormat(id: number, format: number) {
        const work = getWork(id);
        works.set(id, { ...work, format: format });
        setWorks(new Map(works));

        api.updateWorkFormat(id, format).catch(async (reason: unknown) => {
            getWorks();
            await message(`${reason}`, { title: "Failed to update Work Format.", kind: "error" });
        });
    }

    function addWork(work: Work) {
        works.set(work.id, work);
        setWorks(new Map(works));
    }

    function removeWork(id: number) {
        const result = works.delete(id);
        if (!result) {
            api.error(`Missing Work to remove [${id}].`);
        }
        setWorks(new Map(works));
    }

    function attach(workId: number, creatorId: number) {
        const work = getWork(workId);
        works.set(workId, { ...work, creators: [...work.creators, creatorId] });
        setWorks(new Map(works));
    }

    function detach(workId: number, creatorId: number) {
        const work = getWork(workId);
        works.set(workId, { ...work, creators: work.creators.filter((id) => id !== creatorId) });
        setWorks(new Map(works));
    }


    useEffect(() => {
        getWorks();
    }, []);


    return {
        works,
        setWorks,
        getWork,
        getWorks,
        updateWorkName,
        updateWorkProgress,
        updateWorkStatus,
        updateWorkType,
        updateWorkFormat,
        addWork,
        removeWork,
        attach,
        detach
    };
}
