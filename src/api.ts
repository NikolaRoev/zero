import { invoke } from "@tauri-apps/api/tauri";



type Work = {
    id: number,
    name: string,
    progress: string,
    status: string,
    type: string,
    format: string,
    updated: string,
    added: string
}

type Creator = {
    id: number,
    name: string,
    works: number
}

type Status = {
    id: number,
    status: string,
    is_update: boolean
}

type Type = {
    id: number,
    type: string
}

type Format = {
    id: number,
    format: string
}



export function error(message: string): Promise<void> {
    return invoke("error", { message: message });
}

export function databaseIsOpen(): Promise<boolean> {
    return invoke("database_is_open");
}

export function getWorks(): Promise<Work[]> {

}

export function getUpdateWorks(nameFilter: string): Promise<Work[]> {
    return invoke("get_update_works", { nameFilter: nameFilter });
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