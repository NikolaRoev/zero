import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Status } from "../data/api";

export function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);

    function getStatuses (){
        api.getStatuses().then((value) => {
            setStatuses(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getStatuses();
    }, []);

    return { statuses, getStatuses };
}
