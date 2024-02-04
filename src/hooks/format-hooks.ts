import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Format } from "../data/data";
import { StorageKey } from "../data/storage";
import { arrayMove } from "@dnd-kit/sortable";
import { message } from "@tauri-apps/api/dialog";



export default function useFormats() {
    const [formats, setFormats] = useState<Format[]>([]);
  
    
    function getFormat(id: number) {
        const format = formats.find((format) => format.id === id);
        if (!format) {
            const message = `Missing Format [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return format;
    }

    function getFormats() {
        api.getFormats().then((value) => {
            setFormats(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Formats.", type: "error" });
        });
    }

    function addFormat(name: string, callback: () => void) {
        api.addFormat(name).then((id) => {
            setFormats([...formats, { id: id, name: name }]);
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

    function updateFormatName(id: number, name: string) {
        setFormats(formats.map((format) => {
            if (format.id === id) {
                return { ...format, name: name };
            }
            return format;
        }));

        api.updateFormatName(id, name).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to update Format name.", type: "error" });
        });
    }

    function reorderFormats(activeId: number, overId: number) {
        setFormats((formats) => {
            const oldIndex = formats.findIndex((format) => format.id === activeId);
            const newIndex = formats.findIndex((format) => format.id === overId);
            
            return arrayMove(formats, oldIndex, newIndex);
        });

        api.reorderFormats(activeId, overId).catch(async (reason) => {
            getFormats();
            await message(`${reason}`, { title: "Failed to reorder formats.", type: "error" });
        });
    }

    
    useEffect(() => {
        getFormats();
    }, []);
  

    return { formats, getFormat, getFormats, addFormat, removeFormat, updateFormatName, reorderFormats };
}
