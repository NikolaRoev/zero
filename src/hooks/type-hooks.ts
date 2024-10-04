import * as api from "../data/api";
import { useEffect, useState } from "react";
import { StorageKey } from "../data/storage";
import type { Type } from "../data/data";
import { arrayMove } from "@dnd-kit/sortable";
import { message } from "@tauri-apps/plugin-dialog";



export default function useTypes() {
    const [types, setTypes] = useState<Type[]>([]);


    function getType(id: number) {
        const type = types.find((type) => type.id === id);
        if (!type) {
            const message = `Missing Type [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return type;
    }

    function getTypes() {
        api.getTypes().then((value) => {
            setTypes(value);
        }).catch(async (reason: unknown) => {
            await message(`${reason}`, { title: "Failed to get Types.", kind: "error" });
        });
    }

    function addType(name: string, callback: () => void, cleanUp: () => void) {
        api.addType(name).then((id) => {
            setTypes([...types, { id: id, name: name }]);
            callback();
        }).catch(async (reason: unknown) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to add Type.", kind: "error" });
        }).finally(() => { cleanUp(); });
    }

    function removeType(id: number) {
        setTypes(types.filter((type) => type.id !== id));

        api.removeType(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason: unknown) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to remove Type.", kind: "error" });
        });
    }

    function updateTypeName(id: number, name: string) {
        setTypes(types.map((type) => {
            if (type.id === id) {
                return { ...type, name: name };
            }
            return type;
        }));

        api.updateTypeName(id, name).catch(async (reason: unknown) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to update Type name.", kind: "error" });
        });
    }

    function reorderTypes(activeId: number, overId: number) {
        setTypes((types) => {
            const oldIndex = types.findIndex((type) => type.id === activeId);
            const newIndex = types.findIndex((type) => type.id === overId);
            
            return arrayMove(types, oldIndex, newIndex);
        });

        api.reorderTypes(activeId, overId).catch(async (reason: unknown) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to reorder types.", kind: "error" });
        });
    }


    useEffect(() => {
        getTypes();
    }, []);


    return { types, getType, getTypes, addType, removeType, updateTypeName, reorderTypes };
}
