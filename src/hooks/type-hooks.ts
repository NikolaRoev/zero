import * as api from "../data/api";
import { useEffect, useState } from "react";
import { StorageKey } from "../data/storage";
import type { Type } from "../data/data";
import { message } from "@tauri-apps/api/dialog";



export default function useTypes() {
    const [types, setTypes] = useState<Map<number, Type>>(new Map());


    function getType(id: number) {
        const type = types.get(id);
        if (!type) {
            const message = `Missing Type [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return type;
    }

    function getTypes() {
        api.getTypes().then((value) => {
            setTypes(new Map(value.map((v) => [v.id, v])));
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Types.", type: "error" });
        });
    }

    function addType(name: string, callback: () => void) {
        api.addType(name).then((id) => {
            types.set(id, { id: id, name: name });
            setTypes(new Map(types));
            callback();
        }).catch(async (reason) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to add Type.", type: "error" });
        });
    }

    function removeType(id: number) {
        const result = types.delete(id);
        if (!result) {
            api.error(`Missing Type to remove [${id}].`);
        }
        setTypes(new Map(types));

        api.removeType(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to remove Type.", type: "error" });
        });
    }

    function updateTypeName(id: number, name: string) {
        const type = getType(id);
        types.set(id, { ...type, name: name });
        setTypes(new Map(types));

        api.updateTypeName(id, name).catch(async (reason) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to update Type name.", type: "error" });
        });
    }


    useEffect(() => {
        getTypes();
    }, []);


    return { types, getType, getTypes, addType, removeType, updateTypeName };
}
