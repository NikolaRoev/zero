import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Format } from "../data/api";
import { StorageKey } from "../data/storage";
import { message } from "@tauri-apps/api/dialog";



export default function useFormats() {
    const [formats, setFormats] = useState<Format[]>([]);
  

    function getFormats() {
        api.getFormats().then((value) => {
            setFormats(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Formats.", type: "error" });
        });
    }

    function addFormat(format: string, callback: () => void) {
        api.addFormat(format).then((id) => {
            setFormats([...formats, { id: id, format: format }]);
            callback();
        }).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to add Format.", type: "error" });
        });
    }

    function removeFormat(id: number) {
        setFormats(formats.filter((format) => format.id !== id));

        api.removeFormat(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to remove Format.", type: "error" });
        });
    }

    
    useEffect(() => {
        getFormats();
    }, []);
  

    return { formats, addFormat, removeFormat };
}
