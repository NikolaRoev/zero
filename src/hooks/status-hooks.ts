import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Status } from "../data/data";
import { StorageKey } from "../data/storage";
import { arrayMove } from "@dnd-kit/sortable";
import { message } from "@tauri-apps/api/dialog";



export function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);

    
    function getStatus(id: number) {
        const status = statuses.find((status) => status.id === id);
        if (!status) {
            const message = `Missing Status [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return status;
    }

    function getStatuses () {
        api.getStatuses().then((value) => {
            setStatuses(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Statuses.", type: "error" });
        });
    }

    function addStatus(name: string, callback: () => void, cleanUp: () => void) {
        api.addStatus(name).then((id) => {
            setStatuses([...statuses, { id: id, name: name, isUpdate: false }]);
            callback();
        }).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to add Status.", type: "error" });
        }).finally(() => { cleanUp(); });
    }

    function removeStatus(id: number) {
        setStatuses(statuses.filter((status) => status.id !== id));

        api.removeStatus(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to remove Status.", type: "error" });
        });
    }

    function updateStatusName(id: number, name: string) {
        setStatuses(statuses.map((status) => {
            if (status.id === id) {
                return { ...status, name: name };
            }
            return status;
        }));

        api.updateStatusName(id, name).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to update Status name.", type: "error" });
        });
    }

    function updateStatusIsUpdate(id: number, isUpdate: boolean) {
        setStatuses(statuses.map((status) => {
            if (status.id === id) {
                return { ...status, isUpdate: isUpdate };
            }
            return status;
        }));

        api.updateStatusIsUpdate(id, isUpdate).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to update Status is update.", type: "error" });
        });
    }

    function reorderStatuses(activeId: number, overId: number) {
        setStatuses((statuses) => {
            const oldIndex = statuses.findIndex((status) => status.id === activeId);
            const newIndex = statuses.findIndex((status) => status.id === overId);
            
            return arrayMove(statuses, oldIndex, newIndex);
        });

        api.reorderStatuses(activeId, overId).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to reorder statuses.", type: "error" });
        });
    }


    useEffect(() => {
        getStatuses();
    }, []);


    return { statuses, getStatus, getStatuses, addStatus, removeStatus, updateStatusName, updateStatusIsUpdate, reorderStatuses };
}
