import { type ReactElement } from "react";
import clsx from "clsx";
import useSessionState from "../hooks/session-state-hook";



type TabProps = {
    children: React.ReactNode,
    label: React.ReactNode
};

export const Tab = ({ children }: TabProps) => <>{children}</>;


type TabsProps = {
    children: ReactElement<TabProps>[],
    storageKey: string,
    className?: string,
    defaultIndex?: number
}

export function Tabs({ children, storageKey, className, defaultIndex = 0 }: TabsProps) {
    const [index, setIndex] = useSessionState(storageKey, defaultIndex);

    return (
        <div className={className}>
            <div className="pl-[5px] bg-neutral-300">
                {
                    children.map((tab, tabIndex) => (
                        <button
                            key={tabIndex}
                            className={clsx(
                                "px-[15px] rounded-tr-[8px] rounded-tl-[8px] select-none",
                                { "hover:bg-neutral-200 active:bg-neutral-50": tabIndex !== index },
                                tabIndex === index ? "bg-neutral-50" : "bg-neutral-300"
                            )}
                            onClick={() => { setIndex(tabIndex); }}
                        >{tab.props.label}</button>
                    ))
                }
            </div>
            {children[index]}
        </div>
    );
}
