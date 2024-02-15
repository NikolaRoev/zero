import { createContext, useEffect, useRef, useState } from "react";
import { useLongPress, usePress} from "@react-aria/interactions";
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

export function NavLink({ children, title, onClick }: NavLinkProps) {
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

export function NavButton({ children, className, title, onClick }: NavButtonProps) {
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


export function NavPanel({ children }: { children: React.ReactNode }) {
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


export function NavDropDown({ children }: { children: React.ReactNode }) {
    const [navPanelOpen, setNavPanelOpen] = useState(false);

    return (
        <NavContext.Provider value={{ navPanelOpen, setNavPanelOpen }}>
            <div>{children}</div>
        </NavContext.Provider>
    );
}
