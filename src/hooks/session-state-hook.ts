import { useState } from "react";

export default function useSessionState<T>(key: string, initialState: T): [T, (state: T) => void] {
    const storedState = sessionStorage.getItem(key);
    const initialStateInner: T = storedState ? JSON.parse(storedState) as T : initialState;
    const [state, innerSetState] = useState(initialStateInner);

    function setState(state: T) {
        innerSetState(state);
        sessionStorage.setItem(key, JSON.stringify(state));
    }

    return [state, setState];
}
