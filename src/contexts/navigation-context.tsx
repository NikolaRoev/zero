import { StorageKey } from "../data/storage";
import { createContext } from "react";
import useSessionReducer from "../hooks/session-reducer";



type Page =
    { type: "Home" } |
    { type: "Work", id: number } |
    { type: "Creator", id: number }

type NavigationData = {
    index: number,
    pages: Page[]
}

const emtpyNavigationData: NavigationData = {
    index: 0,
    pages: [{ type: "Home" }]
};

type NavigationAction =
    { action: "Clear" } |
    { action: "Home" } |
    { action: "Back" } |
    { action: "Forward" } |
    { action: "New", page: Page } |
    { action: "Go To", index: number }


function navigationReducer(navigationData: NavigationData, action: NavigationAction): NavigationData {
    switch (action.action) {
        case "Clear": {
            return emtpyNavigationData;
        }
        case "Home": {
            return { ...navigationData, index: 0 };
        }
        case "Back": {
            if (navigationData.index > 0) {
                return { ...navigationData, index: navigationData.index - 1 };
            }
            else {
                return navigationData;
            }
        }
        case "Forward": {
            if (navigationData.index + 1 < navigationData.pages.length) {
                return { ...navigationData, index: navigationData.index + 1 };
            }
            else {
                return navigationData;
            }
        }
        case "New": {
            const newPages = navigationData.pages.slice(0, navigationData.index + 1);
            return { index: newPages.length, pages: [...newPages, action.page] };
        }
        case "Go To": {
            return { ...navigationData, index: action.index };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}

export const NavigationContext = createContext<{
    navigationData: NavigationData,
    navigationDispatch: React.Dispatch<NavigationAction>
} | null>(null);

export default function NavigationContextProvider({ children, storageKey }: { children: React.ReactNode, storageKey: StorageKey }) {
    const [navigationData, navigationDispatch] = useSessionReducer(storageKey, navigationReducer, emtpyNavigationData);

    return (
        <NavigationContext.Provider value={{ navigationData: navigationData, navigationDispatch: navigationDispatch }}>
            <div className="grow flex flex-col">
                <div className="flex">
                    <button onClick={() => { navigationDispatch({action: "Home" }); }}>HOME</button>
                    <button onClick={() => { navigationDispatch({action: "Back" }); }}>BACK</button>
                    <button onClick={() => { navigationDispatch({action: "Forward" }); }}>FORWARD</button>
                </div>
                {children}
            </div>
        </NavigationContext.Provider>
    );
}
