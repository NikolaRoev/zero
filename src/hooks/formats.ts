import * as api from "../data/api";
import { useEffect, useState } from "react";
import type { Format } from "../data/api";

export default function useFormats() {
    const [formats, setFormats] = useState<Format[]>([]);
  
    function getFormats() {
        api.getFormats().then((value) => {
            setFormats(value);
        }).catch((reason) => { alert(reason); });
    }

    useEffect(() => {
        getFormats();
    }, []);
  
    return { formats, getFormats };
}
