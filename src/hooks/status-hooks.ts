import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Status } from "../data/data";
import { StorageKey } from "../data/storage";
import { message } from "@tauri-apps/api/dialog";



export function useStatuses() {
    const [statuses, setStatuses] = useState<Map<number, Status>>(new Map());

    
    function getStatus(id: number) {
        const status = statuses.get(id);
        if (!status) {
            const message = `Missing Status [${id}].`;
            api.error(message);
            throw new Error(message);
        }
        return status;
    }

    function getStatuses () {
        api.getStatuses().then((value) => {
            setStatuses(new Map(value.map((v) => [v.id, v])));
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to get Statuses.", type: "error" });
        });
    }

    function addStatus(name: string, callback: () => void) {
        api.addStatus(name).then((id) => {
            statuses.set(id, { id: id, name: name, isUpdate: false });
            setStatuses(new Map(statuses));
            callback();
        }).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to add Status.", type: "error" });
        });
    }

    function removeStatus(id: number) {
        const result = statuses.delete(id);
        if (!result) {
            api.error(`Missing Status to remove [${id}].`);
        }
        setStatuses(new Map(statuses));

        api.removeStatus(id).then(() => {
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to remove Status.", type: "error" });
        });
    }

    function updateStatusName(id: number, name: string) {
        const status = getStatus(id);
        statuses.set(id, { ...status, name: name });
        setStatuses(new Map(statuses));

        api.updateStatusName(id, name).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to update Status name.", type: "error" });
        });
    }

    function updateStatusIsUpdate(id: number, isUpdate: boolean) {
        const status = getStatus(id);
        statuses.set(id, { ...status, isUpdate: isUpdate });
        setStatuses(new Map(statuses));

        api.updateStatusIsUpdate(id, isUpdate).catch(async (reason) => {
            getStatuses();
            await message(`${reason}`, { title: "Failed to update Status is update.", type: "error" });
        });
    }


    useEffect(() => {
        getStatuses();
    }, []);


    return { statuses, getStatus, getStatuses, addStatus, removeStatus, updateStatusName, updateStatusIsUpdate };
}
