import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Status } from "../data/data";
import { StorageKey } from "../data/storage";
import { message } from "@tauri-apps/api/dialog";



export function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);

    
    function getStatuses (){
        api.getStatuses().then((value) => {
            setStatuses(value);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Statuses.", type: "error" });
        });
    }

    function addStatus(status: string, callback: () => void) {
        api.addStatus(status).then((id) => {
            setStatuses([...statuses, { id: id, status: status, isUpdate: false }]);
            callback();
        }).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to add Status.", type: "error" });
        });
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

    function updateStatus(id: number, isUpdate: boolean) {
        setStatuses(statuses.map((status) => {
            if (status.id === id) {
                return { ...status, isUpdate: isUpdate };
            }
            return status;
        }));

        api.updateStatus(id, isUpdate).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to update Status.", type: "error" });
        });
    }


    useEffect(() => {
        getStatuses();
    }, []);


    return { statuses, addStatus, removeStatus, updateStatus };
}
