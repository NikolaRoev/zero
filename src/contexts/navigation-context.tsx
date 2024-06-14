import { StorageKey } from "../data/storage";
import { createContext } from "react";
import useSessionReducer from "../hooks/session-reducer-hook";


export type TabsLevels = "Main" | "Home" | "Config";

type Page =
    { type: "Work", id: number } |
    { type: "Creator", id: number }

type NavigationData = {
    tabsIndex: Map<TabsLevels, number>,
    index: number,
    pages: Page[]
}

type NavigationAction =
    { action: "Remove", page: Page } |
    { action: "Home" } |
    { action: "Back" } |
    { action: "Forward" } |
    { action: "New", page: Page } |
    { action: "Go To", index: number } |
    { action: "Jump To", page: Page } |
    { action: "Tab Change", level: TabsLevels, tabIndex: number }


type NavigationContextData = {
    navigationData: NavigationData,
    navigationDispatch: React.Dispatch<NavigationAction>
}

export const NavigationContext = createContext<NavigationContextData | null>(null);


function navigationReducer(navigationData: NavigationData, action: NavigationAction): NavigationData {
    switch (action.action) {
        case "Remove": {
            let newIndex = navigationData.index;
            const newPages = navigationData.pages.filter((page, index) => {
                if (page.type === action.page.type && page.id === action.page.id) {
                    if (index <= navigationData.index) {
                        newIndex--;
                    }
                    return false;
                }
                return true;
            });
            return { ...navigationData, index: newIndex, pages: newPages };
        }
        case "Home": {
            return { ...navigationData, index: -1 };
        }
        case "Back": {
            if (navigationData.index >= 0) {
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
            return { ...navigationData, index: newPages.length, pages: [...newPages, action.page] };
        }
        case "Go To": {
            return { ...navigationData, index: action.index };
        }
        case "Jump To": {
            navigationData.tabsIndex.set("Main", 1);
            return { ...navigationData, tabsIndex: new Map(navigationData.tabsIndex), index: 0, pages: [action.page] };
        }
        case "Tab Change": {
            navigationData.tabsIndex.set(action.level, action.tabIndex);
            return { ...navigationData, tabsIndex: new Map(navigationData.tabsIndex) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}


export default function NavigationContextProvider({ children }: { children: React.ReactNode }) {
    const [navigationData, navigationDispatch] = useSessionReducer(
        StorageKey.Navigation,
        navigationReducer,
        {
            tabsIndex: new Map([
                ["Main" as TabsLevels, 0],
                ["Home" as TabsLevels, 0],
                ["Config" as TabsLevels, 0]
            ]),
            index: -1,
            pages: []
        }
    );

    return (
        <NavigationContext.Provider
            value={{
                navigationData: navigationData,
                navigationDispatch: navigationDispatch
            }}
        >{children}</NavigationContext.Provider>
    );
}
