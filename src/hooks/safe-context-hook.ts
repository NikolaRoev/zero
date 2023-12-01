import * as api from "../data/api";
import { useContext } from "react";

export default function useSafeContext<T>(context: React.Context<T>) {
    const contextObject = useContext(context);

    if (!contextObject) {
        const message = "Missing Context.";
        api.error(message);
        throw new Error(message);
    }

    return contextObject;
}
