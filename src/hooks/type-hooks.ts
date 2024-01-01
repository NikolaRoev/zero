import * as api from "../data/api";
import { useEffect, useState } from "react";
import { StorageKey } from "../data/storage";
import type { Type } from "../data/data";
import { message } from "@tauri-apps/api/dialog";



export default function useTypes() {
    const [types, setTypes] = useState<Type[]>([]);


    function getTypes() {
        api.getTypes().then((value) => {
            setTypes(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Types.", type: "error" });
        });
    }

    function addType(name: string, callback: () => void) {
        api.addType(name).then((id) => {
            setTypes([...types, { id: id, name: name }]);
            callback();
        }).catch(async (reason) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to add Type.", type: "error" });
        });
    }

    function removeType(id: number) {
        setTypes(types.filter((type) => type.id !== id));

        api.removeType(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getTypes();
            await message(`${reason}`, { title: "Failed to remove Type.", type: "error" });
        });
    }

    function updateTypeName(id: number, typeName: string) {
        setTypes(types.map((type) => {
            if (type.id === id) {
                return { ...type, name: typeName };
            }
            return type;
        }));
    }


    useEffect(() => {
        getTypes();
    }, []);


    return { types, getTypes, addType, removeType, updateTypeName };
}
