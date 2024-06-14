import { BsArrowLeft, BsArrowRight, BsHouse } from "react-icons/bs";
import { createContext, useEffect, useRef, useState } from "react";
import { useLongPress, usePress} from "@react-aria/interactions";
import { DataContext } from "../contexts/data-context";
import { NavigationContext } from "../contexts/navigation-context";
import clsx from "clsx";
import { mergeProps } from "@react-aria/utils";
import useSafeContext from "../hooks/safe-context-hook";



type NavContextData = {
    navPanelOpen: boolean,
    setNavPanelOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NavContext = createContext<NavContextData | null>(null);


type NavLinkProps = {
    children?: React.ReactNode,
    title?: string,
    onClick: () => void
}

function NavLink({ children, title, onClick }: NavLinkProps) {
    const { setNavPanelOpen } = useSafeContext(NavContext);

    return (
        <button
            className={clsx(
                "grow px-[10px] py-[3px] text-left",
                "hover:bg-neutral-200 active:bg-neutral-300 rounded",
                "whitespace-nowrap overflow-hidden overflow-ellipsis"
            )}
            title={title}
            onClick={() => { setNavPanelOpen(false); onClick(); }}
        >{children}</button>
    );
}


type NavButtonProps = {
    children?: React.ReactNode,
    className?: string,
    title?: string,
    onClick: () => void
}

function NavButton({ children, className, title, onClick }: NavButtonProps) {
    const { setNavPanelOpen } = useSafeContext(NavContext);
    const { longPressProps } = useLongPress({
        onLongPress: () => { setNavPanelOpen(true); }
    });
    const { pressProps } = usePress({
        onPressStart: (e) => { e.continuePropagation(); },
        onPress: () => { onClick(); }
    });

    return (
        <button
            {...mergeProps(pressProps, longPressProps)}
            className={clsx("relative", className)}
            title={title}
            type="button"
            onContextMenu={(e) => { e.preventDefault(); setNavPanelOpen(true); }}
        >{children}</button>
    );
}


function NavPanel({ children }: { children: React.ReactNode }) {
    const navPanelRef = useRef<HTMLDivElement>(null);
    const { navPanelOpen, setNavPanelOpen } = useSafeContext(NavContext);


    useEffect(() => {
        const handleClickEvent = (event: MouseEvent) => {
            if (!navPanelRef.current?.contains(event.target as Node)) {
                setNavPanelOpen(false);
            }
        };

        window.addEventListener("pointerdown", handleClickEvent);
        
        return () => {
            window.removeEventListener("pointerdown", handleClickEvent);
        };
    }, [setNavPanelOpen]);


    return (
        navPanelOpen && <div
            ref={navPanelRef}
            className={clsx(
                "min-w-[100px] max-w-[300px] max-h-1/2 absolute z-50",
                "flex flex-col bg-neutral-50 shadow-lg shadow-neutral-700 rounded overflow-y-auto"
            )}
        ><div className="flex flex-col rounded">{children}</div></div>
    );
}


function NavDropDown({ children }: { children: React.ReactNode }) {
    const [navPanelOpen, setNavPanelOpen] = useState(false);

    return (
        <NavContext.Provider value={{ navPanelOpen, setNavPanelOpen }}>
            <div>{children}</div>
        </NavContext.Provider>
    );
}


export default function NavBar() {
    const { works, creators } = useSafeContext(DataContext);
    const { navigationData, navigationDispatch } = useSafeContext(NavigationContext);


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
    );
}
