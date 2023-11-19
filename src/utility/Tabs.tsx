import { type ReactElement, useState } from "react";



type TabProps = {
    children: ReactElement | ReactElement[],
};
export const Tab = ({ children }: TabProps) => <>{children}</>;


type TabsContentsProps = {
    children: ReactElement<TabProps>[],
    className?: string
};
export const TabsContents = ({}: TabsContentsProps) => <></>;


type TabButtonProps = {
    children: ReactElement | ReactElement[] | string,
    className?: string
};
export const TabButton = ({}: TabButtonProps) => <></>;


type TabBarProps = {
    children: ReactElement<TabButtonProps>[],
    className?: string
};
export const TabBar = ({}: TabBarProps) => <></>;


type TabsProps = {
    children: [ReactElement<TabBarProps>, ReactElement<TabsContentsProps>],
    className?: string
}

export default function Tabs({ children, className }: TabsProps) {
    const [index, setIndex] = useState(0);


    const tabBar = children.find((child) => child.type === TabBar);
    const tabsContents = children.find((child) => child.type === TabsContents);

    if (!tabBar) { throw Error("Missing Tab Bar."); }
    if (!tabsContents) { throw Error("Missing Tabs Contents."); }


    return (
        <div className={className}>
            <div className={tabBar.props.className}>
                {
                    tabBar.props.children.map((tabButton: ReactElement<TabButtonProps>, tabButtonIndex) => (
                        <button
                            key={tabButtonIndex}
                            className={tabButton.props.className}
                            onClick={() => { setIndex(tabButtonIndex); }}
                        >{tabButton.props.children}</button>
                    ))
                }
            </div>
            <div className={tabsContents.props.className}>
                {tabsContents.props.children[index]}
            </div>
        </div>
    );
}
