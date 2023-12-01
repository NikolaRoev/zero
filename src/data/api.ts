import { invoke } from "@tauri-apps/api/tauri";



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
    isUpdate: boolean
}

export type Type = {
    id: number,
    type: string
}

export type Format = {
    id: number,
    format: string
}


export function info(message: string) {
    console.log(message);
    invoke("info", { message }).catch((reason) => { console.error(reason); });
}

export function error(message: string) {
    console.error(message);
    invoke("error", { message }).catch((reason) => { console.error(reason); });
}

export function openDatabase(path: string): Promise<void> {
    return invoke("open_database", { path });
}

export function databasePath(): Promise<string | null> {
    return invoke("database_path");
}

export function getWork(id: number): Promise<Work> {
    return invoke("get_work", { id });
}

export function getWorks(): Promise<Work[]> {
    return invoke("get_works");
}

export function getUpdateWorks(): Promise<UpdateWork[]> {
    return invoke("get_update_works");
}

export function getWorkCreators(workId: number): Promise<Creator[]> {
    return invoke("get_work_creators", { workId });
}

export function getCreator(id: number): Promise<Creator> {
    return invoke("get_creator", { id });
}

export function getCreators(): Promise<Creator[]> {
    return invoke("get_creators");
}

export function getCreatorWorks(creatorId: number): Promise<Work[]> {
    return invoke("get_creator_works", { creatorId });
}

export function updateWorkName(id: number, name: string): Promise<void> {
    return invoke("update_work_name", { id, name });
}

export function updateWorkProgress(id: number, progress: string): Promise<void> {
    return invoke("update_work_progress", { id, progress });
}

export function updateWorkStatus(id: number, status: string): Promise<void> {
    return invoke("update_work_status", { id, status });
}

export function updateWorkType(id: number, type: string): Promise<void> {
    return invoke("update_work_type", { id, type });
}

export function updateWorkFormat(id: number, format: string): Promise<void> {
    return invoke("update_work_format", { id, format });
}

export function updateCreatorName(id: number, name: string): Promise<void> {
    return invoke("update_creator_name", { id, name });
}

export function addWork(name: string, progress: string, status: string, type: string, format: string, creators: number[]): Promise<void> {
    return invoke("add_work", { name, progress, status, type, format, creators });
}

export function addCreator(name: string, works: number[]): Promise<void> {
    return invoke("add_creator", { name, works });
}

export function addStatus(status: string): Promise<number> {
    return invoke("add_status", { status });
}

export function getStatuses(): Promise<Status[]> {
    return invoke("get_statuses");
}

export function updateStatus(id: number, isUpdate: boolean): Promise<void> {
    return invoke("update_status", { id, isUpdate });
}

export function removeStatus(id: number): Promise<void> {
    return invoke("remove_status", { id });
}

export function addType(type: string): Promise<number> {
    return invoke("add_type", { type });
}

export function getTypes(): Promise<Type[]> {
    return invoke("get_types");
}

export function removeType(id: number): Promise<void> {
    return invoke("remove_type", { id });
}

export function addFormat(format: string): Promise<number> {
    return invoke("add_format", { format });
}

export function getFormats(): Promise<Format[]> {
    return invoke("get_formats");
}

export function removeFormat(id: number): Promise<void> {
    return invoke("remove_format", { id });
}

export function attach(workId: number, creatorId: number): Promise<void> {
    return invoke("attach", { workId, creatorId });
}

export function detach(workId: number, creatorId: number): Promise<void> {
    return invoke("detach", { workId, creatorId });
}

export function getRecentDatabases(): Promise<string[]> {
    return invoke("get_recent_databases");
}

export function removeRecentDatabase(path: string): Promise<void> {
    return invoke("remove_recent_database", { path });
}
