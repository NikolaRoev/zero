import { useReducer } from "react";

export default function useSessionReducer<S, A>(key: string, reducer: (state: S, action: A) => S, defaultValue: S) {
    const innerReducer = (state: S, action: A) => {
        const newState = reducer(state, action);
        sessionStorage.setItem(key, JSON.stringify(newState));
        return newState;
    };

    const storedState = sessionStorage.getItem(key);
    const initialState: S = storedState ? JSON.parse(storedState) as S : defaultValue;
    return useReducer(innerReducer, initialState);
}
