import type { Creator, Format, Status, Type, Work } from "./data";
import { type LogOptions, error as tauriError } from "@tauri-apps/plugin-log";
import { invoke } from "@tauri-apps/api/core";



export function error(message: string, options?: LogOptions) {
    tauriError(message, options).catch((reason: unknown) => { console.error(`Failed to log: ${reason}.`); });
}


export function openDatabase(path: string): Promise<void> {
    return invoke("open_database", { path });
}

export function databasePath(): Promise<string | null> {
    return invoke("database_path");
}

export function getWorks(): Promise<Work[]> {
    return invoke("get_works");
}

export function getCreators(): Promise<Creator[]> {
    return invoke("get_creators");
}

export function updateWorkName(id: number, name: string): Promise<void> {
    return invoke("update_work_name", { id, name });
}

export function updateWorkProgress(id: number, progress: string, timestamp: number): Promise<void> {
    return invoke("update_work_progress", { id, progress, timestamp });
}

export function updateWorkStatus(id: number, status: number, timestamp: number): Promise<void> {
    return invoke("update_work_status", { id, status, timestamp });
}

export function updateWorkType(id: number, type: number): Promise<void> {
    return invoke("update_work_type", { id, type });
}

export function updateWorkFormat(id: number, format: number): Promise<void> {
    return invoke("update_work_format", { id, format });
}

export function updateCreatorName(id: number, name: string): Promise<void> {
    return invoke("update_creator_name", { id, name });
}

export function addWork(work: Work): Promise<number> {
    return invoke("add_work", { work });
}

export function addCreator(creator: Creator): Promise<number> {
    return invoke("add_creator", { creator });
}

export function addStatus(name: string): Promise<number> {
    return invoke("add_status", { name });
}

export function getStatuses(): Promise<Status[]> {
    return invoke("get_statuses");
}

export function updateStatusName(id: number, name: string): Promise<void> {
    return invoke("update_status_name", { id, name });
}

export function updateStatusIsUpdate(id: number, isUpdate: boolean): Promise<void> {
    return invoke("update_status_is_update", { id, isUpdate });
}

export function reorderStatuses(activeId: number, overId: number): Promise<void> {
    return invoke("reorder_statuses", { activeId, overId });
}

export function removeWork(id: number): Promise<void> {
    return invoke("remove_work", { id });
}

export function removeCreator(id: number): Promise<void> {
    return invoke("remove_creator", { id });
}

export function removeStatus(id: number): Promise<void> {
    return invoke("remove_status", { id });
}

export function addType(name: string): Promise<number> {
    return invoke("add_type", { name });
}

export function getTypes(): Promise<Type[]> {
    return invoke("get_types");
}

export function removeType(id: number): Promise<void> {
    return invoke("remove_type", { id });
}

export function updateTypeName(id: number, name: string): Promise<void> {
    return invoke("update_type_name", { id, name });
}

export function reorderTypes(activeId: number, overId: number): Promise<void> {
    return invoke("reorder_types", { activeId, overId });
}

export function addFormat(name: string): Promise<number> {
    return invoke("add_format", { name });
}

export function getFormats(): Promise<Format[]> {
    return invoke("get_formats");
}

export function removeFormat(id: number): Promise<void> {
    return invoke("remove_format", { id });
}

export function updateFormatName(id: number, name: string): Promise<void> {
    return invoke("update_format_name", { id, name });
}

export function reorderFormats(activeId: number, overId: number): Promise<void> {
    return invoke("reorder_formats", { activeId, overId });
}

export function attach(workId: number, creatorId: number): Promise<void> {
    return invoke("attach", { workId, creatorId });
}

export function detach(workId: number, creatorId: number): Promise<void> {
    return invoke("detach", { workId, creatorId });
}
