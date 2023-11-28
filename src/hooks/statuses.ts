import * as api from "../data/api";
import { useCallback, useEffect, useState } from "react";
import type { Status } from "../data/api";

export function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);

    const getStatuses = useCallback(() => {
        api.getStatuses().then((value) => {
            setStatuses(value);
        }).catch((reason) => { alert(reason); });
    }, []);

    useEffect(() => {
        getStatuses();
    }, [getStatuses]);

    return { statuses, setStatuses, getStatuses };
}
