import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Type } from "../data/api";

export default function useTypes() {
    const [types, setTypes] = useState<Type[]>([]);
  
    function getTypes() {
        api.getTypes().then((value) => {
            setTypes(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getTypes();
    }, []);
  
    return { types, getTypes };
}
