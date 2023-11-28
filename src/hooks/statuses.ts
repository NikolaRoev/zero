import * as api from "../data/api";
import { useCallback, useEffect, useState } from "react";
import type { Status } from "../data/api";
import useEvent from "./event";

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

    useEvent(api.MODIFIED_STATUSES_EVENT, getStatuses);

    return { statuses, setStatuses, getStatuses };
}
