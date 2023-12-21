import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Creator } from "../data/data";
import { message } from "@tauri-apps/api/dialog";



export function useCreators() {
    const [creators, setCreators] = useState<Map<number, Creator>>(new Map());


    function getCreator(id: number) {
        const creator = creators.get(id);
        if (!creator) {
            const message = `Missing Creator [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return creator;
    }

    function getCreators() {
        api.getCreators().then((value) => {
            setCreators(new Map(value.map((v) => [v.id, v])));
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Creators.", type: "error" });
        });
    }

    function updateCreatorName(id: number, name: string) {
        api.updateCreatorName(id, name).then(() => {
            const creator = getCreator(id);
            creators.set(id, { ...creator, name: name });
            setCreators(new Map(creators));
        }).catch(async (reason: string) => {
            getCreators();
            await message(reason, { title: "Failed to update Creator Name.", type: "error" });
        });
    }

    function addCreator(creator: Creator) {
        creators.set(creator.id, creator);
        setCreators(new Map(creators));
    }

    function removeCreator(id: number) {
        const result = creators.delete(id);
        if (!result) {
            api.error(`Missing Creator to remove [${id}].`);
        }
        setCreators(new Map(creators));
    }

    function attach(workId: number, creatorId: number) {
        const creator = getCreator(creatorId);
        creators.set(creatorId, { ...creator, works: [...creator.works, workId] });
        setCreators(new Map(creators));
    }

    function detach(workId: number, creatorId: number) {
        const creator = getCreator(creatorId);
        creators.set(creatorId, { ...creator, works: creator.works.filter((id) => id !== workId) });
        setCreators(new Map(creators));
    }


    useEffect(() => {
        getCreators();
    }, []);


    return { creators, getCreator, getCreators, updateCreatorName, addCreator, removeCreator, attach, detach };
}
