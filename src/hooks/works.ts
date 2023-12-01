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
    const [work, setWork] = useState<Work>({
        id: 0, name: "", progress: "", status: "", type: "", format: "", updated: "", added: ""
    });
    const [workCreators, setWorkCreators] = useState<Creator[]>([]);

    const getWork = useCallback(() => {
        api.getWork(id).then((value) => {
            setWork(value);
        }).catch((reason) => { alert(reason); });
    }, [id]);

    const getWorkCreators = useCallback(() => {
        api.getWorkCreators(id).then((value) => {
            setWorkCreators(value);
        }).catch((reason) => { alert(reason); });
    }, [id]);

    useEffect(() => {
        getWork();
        getWorkCreators();
    }, [getWork, getWorkCreators]);

    return { work, setWork, getWork, workCreators, getWorkCreators };
}
