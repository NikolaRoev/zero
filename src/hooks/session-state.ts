import { useState } from "react";

export default function useSessionState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const storedValue = sessionStorage.getItem(key);
    const initialValue: T = storedValue ? JSON.parse(storedValue) as T : defaultValue;
    const [state, innerSetState] = useState(initialValue);

    function setState(value: T) {
        innerSetState(value);
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    return [state, setState];
}
