export type Work = {
    id: number,
    name: string,
    progress: string,
    status: number,
    type: number,
    format: number,
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
