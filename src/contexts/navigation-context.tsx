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
    dispatch: React.Dispatch<NavigationAction>
} | null>(null);

export default function NavigationContextProvider({ children }: { children: React.ReactNode }) {
    const [navigationData, dispatch] = useSessionReducer(StorageKey.Navigation, navigationReducer, emtpyNavigationData);

    return (
        <NavigationContext.Provider value={{ navigationData: navigationData, dispatch: dispatch }}>
            {children}
        </NavigationContext.Provider>
    );
}
