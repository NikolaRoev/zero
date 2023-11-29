import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Creator } from "../data/api";



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
