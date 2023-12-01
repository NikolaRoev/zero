import * as api from "../data/api";
import type { Creator, Work } from "../data/api";
import { useCallback, useEffect, useState } from "react";



export function useCreators() {
    const [creators, setCreators] = useState<Creator[]>([]);

    function getCreators() {
        api.getCreators().then((value) => {
            setCreators(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getCreators();
    }, []);

    return { creators };
}

export function useCreator(id: number) {
    const [creator, setCreator] = useState<Creator>({
        id: 0, name: "", works: 0
    });
    const [creatorWorks, setCreatorWorks] = useState<Work[]>([]);

    const getCreator = useCallback(() => {
        api.getCreator(id).then((value) => {
            setCreator(value);
        }).catch((reason) => { alert(reason); });
    }, [id]);

    const getCreatorWorks = useCallback(() => {
        api.getCreatorWorks(id).then((value) => {
            setCreatorWorks(value);
        }).catch((reason) => { alert(reason); });
    }, [id]);

    useEffect(() => {
        getCreator();
        getCreatorWorks();
    }, [getCreator, getCreatorWorks]);

    return { creator, setCreator, getCreator, creatorWorks, getCreatorWorks };
}
