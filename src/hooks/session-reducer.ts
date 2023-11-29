import type { StorageKey } from "../data/storage-key";
import { useReducer } from "react";

export default function useSessionReducer<S, A>(key: StorageKey, reducer: (state: S, action: A) => S, initialState: S) {
    const innerReducer = (state: S, action: A) => {
        const newState = reducer(state, action);
        sessionStorage.setItem(key, JSON.stringify(newState));
        return newState;
    };

    const storedState = sessionStorage.getItem(key);
    const initialStateInner: S = storedState ? JSON.parse(storedState) as S : initialState;
    return useReducer(innerReducer, initialStateInner);
}
