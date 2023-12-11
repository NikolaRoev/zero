import { type ReactElement } from "react";
import type { StorageKey } from "../data/storage";
import clsx from "clsx";
import useSessionState from "../hooks/session-state";



type TabProps = {
    children: ReactElement | ReactElement[],
};
export const Tab = ({ children }: TabProps) => <>{children}</>;


type TabsContentsProps = {
    children: ReactElement<TabProps>[],
};
export const TabsContents = ({}: TabsContentsProps) => <></>;


type TabButtonProps = {
    children: ReactElement | ReactElement[] | string,
};
export const TabButton = ({}: TabButtonProps) => <></>;


type TabBarProps = {
    children: ReactElement<TabButtonProps>[],
};
export const TabBar = ({}: TabBarProps) => <></>;


type TabsProps = {
    children: [ReactElement<TabBarProps>, ReactElement<TabsContentsProps>],
    storageKey: StorageKey,
    className?: string,
    defaultIndex?: number
}

export function Tabs({ children, storageKey, className, defaultIndex = 0 }: TabsProps) {
    const [index, setIndex] = useSessionState(storageKey, defaultIndex);

    const tabBar = children.find((child) => child.type === TabBar) as ReactElement<TabBarProps>;
    const tabsContents = children.find((child) => child.type === TabsContents) as ReactElement<TabsContentsProps>;

    return (
        <div className={className}>
            <div className="pl-[5px] bg-neutral-300">
                {
                    tabBar.props.children.map((tabButton: ReactElement<TabButtonProps>, tabButtonIndex) => (
                        <button
                            key={tabButtonIndex}
                            className={clsx(
                                "px-[15px] rounded-tr-[8px] rounded-tl-[8px]",
                                { "hover:bg-neutral-200 active:bg-neutral-50": tabButtonIndex !== index },
                                tabButtonIndex === index ? "bg-neutral-50" : "bg-neutral-300"
                            )}
                            onClick={() => { setIndex(tabButtonIndex); }}
                        >{tabButton.props.children}</button>
                    ))
                }
            </div>
            {tabsContents.props.children[index]}
        </div>
    );
}