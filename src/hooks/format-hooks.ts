import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Format } from "../data/data";
import { StorageKey } from "../data/storage";
import { message } from "@tauri-apps/api/dialog";



export default function useFormats() {
    const [formats, setFormats] = useState<Map<number, Format>>(new Map());
  
    
    function getFormat(id: number) {
        const format = formats.get(id);
        if (!format) {
            const message = `Missing Format [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return format;
    }

    function getFormats() {
        api.getFormats().then((value) => {
            setFormats(new Map(value.map((v) => [v.id, v])));
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Formats.", type: "error" });
        });
    }

    function addFormat(name: string, callback: () => void) {
        api.addFormat(name).then((id) => {
            formats.set(id, { id: id, name: name });
            setFormats(new Map(formats));
            callback();
        }).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to add Format.", type: "error" });
        });
    }

    function removeFormat(id: number) {
        const result = formats.delete(id);
        if (!result) {
            api.error(`Missing Format to remove [${id}].`);
        }
        setFormats(new Map(formats));

        api.removeFormat(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to remove Format.", type: "error" });
        });
    }

    function updateFormatName(id: number, name: string) {
        const format = getFormat(id);
        formats.set(id, { ...format, name: name });
        setFormats(new Map(formats));

        api.updateFormatName(id, name).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to update Format name.", type: "error" });
        });
    }

    
    useEffect(() => {
        getFormats();
    }, []);
  

    return { formats, getFormat, getFormats, addFormat, removeFormat, updateFormatName };
}
