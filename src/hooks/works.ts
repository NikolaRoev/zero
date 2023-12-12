import * as api from "../data/api";
import type { Creator, UpdateWork, Work } from "../data/api";
import { useCallback, useEffect, useState } from "react";



export function useUpdateWorks() {
    const [updateWorks, setUpdateWorks] = useState<UpdateWork[]>([]);

    function getUpdateWorks() {
        api.getUpdateWorks().then((value) => {
            setUpdateWorks(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getUpdateWorks();
    }, []);

    return { updateWorks, setUpdateWorks, getUpdateWorks };
}

export function useWorks() {
    const [works, setWorks] = useState<Work[]>([]);

    function getWorks() {
        api.getWorks().then((value) => {
            setWorks(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getWorks();
    }, []);

    return { works };
}

export function useWork(id: number) {
    const [work, setWork] = useState<Work>();

    const getWork = useCallback(() => {
        api.getWork(id).then((value) => {
            setWork(value);
        }).catch((reason) => { alert(reason); });
    }, [id]);

    useEffect(() => {
        getWork();
    }, [getWork]);

    return { work, setWork, getWork };
}

export function useWorkCreators(workId: number) {
    const [workCreators, setWorkCreators] = useState<Creator[]>([]);

    const getWorkCreators = useCallback(() => {
        api.getWorkCreators(workId).then((value) => {
            setWorkCreators(value);
        }).catch((reason) => { alert(reason); });
    }, [workId]);

    useEffect(() => {
        getWorkCreators();
    }, [getWorkCreators]);

    return { workCreators, setWorkCreators, getWorkCreators };
}
