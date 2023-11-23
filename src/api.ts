import { invoke } from "@tauri-apps/api/tauri";



export const OPENED_DATABASE_EVENT = "opened-database";
export const CLOSED_DATABASE_EVENT = "closed-database";
export const CHANGED_STATUS_ISUPDATE_EVENT = "changed-status-isupdate";
export const ADDED_STATUS_EVENT = "added-status";
export const ADDED_TYPE_EVENT = "added-type";
export const ADDED_FORMAT_EVENT = "added-format";



export type Work = {
    id: number,
    name: string,
    progress: string,
    status: string,
    type: string,
    format: string,
    updated: string,
    added: string
}

export type UpdateWork = {
    id: number,
    name: string,
    progress: string,
}

export type Creator = {
    id: number,
    name: string,
    works: number
}

export type Status = {
    id: number,
    status: string,
    is_update: boolean
}

export type Type = {
    id: number,
    type: string
}

export type Format = {
    id: number,
    format: string
}



export function error(message: string): Promise<void> {
    console.error(message);
    return invoke("error", { message: message });
}

export function openDatabase(path: string): Promise<void> {
    return invoke("open_database", { path: path });
}

export function databaseIsOpen(): Promise<boolean> {
    return invoke("database_is_open");
}

export function getWorks(): Promise<Work[]> {
    return invoke("get_works");
}

export function getUpdateWorks(name: string): Promise<UpdateWork[]> {
    return invoke("get_update_works", { name: name });
}

export function updateWorkName(id: number, name: string): Promise<void> {
    return invoke("update_work_name", { id: id, name: name });
}

export function updateWorkProgress(id: number, progress: string): Promise<void> {
    return invoke("update_work_progress", { id: id, progress: progress });
}

export function addStatus(status: string): Promise<void> {
    return invoke("add_status", { status: status });
}

export function getStatuses(): Promise<Status[]> {
    return invoke("get_statuses");
}

export function updateStatus(id: number, isUpdate: boolean): Promise<void> {
    return invoke("update_status", { id: id, isUpdate: isUpdate });
}

export function removeStatus(id: number): Promise<void> {
    return invoke("remove_status", { id: id });
}

export function addType(type: string): Promise<void> {
    return invoke("add_type", { type: type });
}

export function getTypes(): Promise<Type[]> {
    return invoke("get_types");
}

export function removeType(id: number): Promise<void> {
    return invoke("remove_type", { id: id });
}

export function addFormat(format: string): Promise<void> {
    return invoke("add_format", { format: format });
}

export function getFormats(): Promise<Format[]> {
    return invoke("get_formats");
}

export function removeFormat(id: number): Promise<void> {
    return invoke("remove_format", { id: id });
}

export function getRecentDatabases(): Promise<string[]> {
    return invoke("get_recent_databases");
}

export function removeRecentDatabase(path: string): Promise<void> {
    return invoke("remove_recent_database", { path: path });
}
