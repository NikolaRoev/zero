import * as api from "../data/api";
import type { UpdateWork, Work } from "../data/api";
import { useEffect, useState } from "react";



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
