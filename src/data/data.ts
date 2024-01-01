export type Work = {
    id: number,
    name: string,
    progress: string,
    status: string,
    type: string,
    format: string,
    updated: number,
    added: number,
    creators: number[]
}

export type Creator = {
    id: number,
    name: string,
    works: number[]
}

export type Status = {
    id: number,
    name: string,
    isUpdate: boolean
}

export type Type = {
    id: number,
    name: string
}

export type Format = {
    id: number,
    name: string
}



export function workNameSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => a.name.localeCompare(b.name) :
        (a: Work, b: Work) => b.name.localeCompare(a.name);
}

export function workProgressSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => {
            const numA = Number(a.progress) || Number.POSITIVE_INFINITY;
            const numB = Number(b.progress) || Number.POSITIVE_INFINITY;
            return numA - numB;
        } :
        (a: Work, b: Work) => {
            const numA = Number(a.progress) || Number.NEGATIVE_INFINITY;
            const numB = Number(b.progress) || Number.NEGATIVE_INFINITY;
            return numB - numA;
        };
}

export function workStatusSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => a.status.localeCompare(b.status) :
        (a: Work, b: Work) => b.status.localeCompare(a.status);
}

export function workTypeSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => a.type.localeCompare(b.type) :
        (a: Work, b: Work) => b.type.localeCompare(a.type);
}

export function workFormatSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => a.format.localeCompare(b.format) :
        (a: Work, b: Work) => b.format.localeCompare(a.format);
}

export function workUpdatedSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => b.updated - a.updated :
        (a: Work, b: Work) => a.updated - b.updated;
}

export function workAddedSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Work, b: Work) => b.added - a.added :
        (a: Work, b: Work) => a.added - b.added;
}


export function creatorNameSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Creator, b: Creator) => a.name.localeCompare(b.name) :
        (a: Creator, b: Creator) => b.name.localeCompare(a.name);
}

export function creatorWorksSortFnGen(ascending: boolean) {
    return ascending ?
        (a: Creator, b: Creator) => a.works.length - b.works.length :
        (a: Creator, b: Creator) => b.works.length - a.works.length;
}
