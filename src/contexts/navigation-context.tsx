import { BsArrowLeft, BsArrowRight, BsHouse } from "react-icons/bs";
import { NavButton, NavDropDown, NavLink, NavPanel } from "../components/NavButton";
import { DataContext } from "./data-context";
import clsx from "clsx";
import { createContext } from "react";
import useSafeContext from "../hooks/safe-context-hook";
import useSessionReducer from "../hooks/session-reducer-hook";



type Page =
    { type: "Work", id: number } |
    { type: "Creator", id: number }

type NavigationData = {
    index: number,
    pages: Page[]
}

type NavigationAction =
    { action: "Remove", page: Page } |
    { action: "Home" } |
    { action: "Back" } |
    { action: "Forward" } |
    { action: "New", page: Page } |
    { action: "Go To", index: number }


type NavigationContextData = {
    navigationData: NavigationData,
    navigationDispatch: React.Dispatch<NavigationAction>
};

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
            return { index: newIndex, pages: newPages };
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


export default function NavigationContextProvider({ children, storageKey }: { children: React.ReactNode, storageKey: string }) {
    const [navigationData, navigationDispatch] = useSessionReducer(
        storageKey,
        navigationReducer,
        { index: -1, pages: [] }
    );
    const { works, creators } = useSafeContext(DataContext);

    const backItems: React.ReactNode[] = [];
    const forwardItems: React.ReactNode[] = [];
    navigationData.pages.forEach((page, index) => {
        if (index === navigationData.index) { return; }
        const navItem = (
            <NavLink
                key={`${page.type} ${page.id} ${index}`}
                onClick={() => { navigationDispatch({action: "Go To", index: index}); }}
            >{page.type === "Work" ? works.get(page.id)?.name : creators.get(page.id)?.name }</NavLink>
        );

        if (index < navigationData.index) { backItems.unshift(navItem); }
        else { forwardItems.push(navItem); }
    });

    return (
        <NavigationContext.Provider value={{ navigationData: navigationData, navigationDispatch: navigationDispatch }}>
            <div className="grow flex flex-col">
                <div className="h-[30px] p-[5px] flex gap-x-[8px] bg-neutral-50">
                    <button
                        className={clsx(
                            "p-[2px] rounded select-none",
                            "hover:bg-neutral-200 active:bg-neutral-300",
                            { "pointer-events-none": navigationData.index === -1 }
                        )}
                        onClick={() => { navigationDispatch({action: "Home" }); }}
                    ><BsHouse className={clsx({ "fill-neutral-400": navigationData.index === -1 })}/></button>
                    
                    <NavDropDown>
                        <NavButton
                            className={clsx(
                                "p-[2px] rounded select-none",
                                "hover:bg-neutral-200 active:bg-neutral-300",
                                { "pointer-events-none": navigationData.index === -1 }
                            )}
                            onClick={() => { navigationDispatch({ action: "Back" }); }}
                        ><BsArrowLeft className={clsx({ "fill-neutral-400": navigationData.index === -1 })} /></NavButton>
                        <NavPanel>
                            {backItems}
                            <NavLink onClick={() => { navigationDispatch({ action: "Home" }); }}>Home</NavLink>
                        </NavPanel>
                    </NavDropDown>

                    <NavDropDown>
                        <NavButton
                            className={clsx(
                                "p-[2px] rounded select-none",
                                "hover:bg-neutral-200 active:bg-neutral-300",
                                { "pointer-events-none": navigationData.index >= (navigationData.pages.length - 1) }
                            )}
                            onClick={() => { navigationDispatch({ action: "Forward" }); }}
                        ><BsArrowRight className={clsx({ "fill-neutral-400": navigationData.index >= (navigationData.pages.length - 1) })} /></NavButton>
                        <NavPanel>
                            {forwardItems}
                        </NavPanel>
                    </NavDropDown>
                </div>
                {children}
            </div>
        </NavigationContext.Provider>
    );
}
