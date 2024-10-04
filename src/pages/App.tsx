import NavigationContextProvider, { NavigationContext } from "../contexts/navigation-context";
import { Tab, Tabs } from "../components/Tabs";
import ConfigurationTab from "./configuration/ConfigurationTab";
import DataContextProvider from "../contexts/data-context";
import LibraryTab from "./library/LibraryTab";
import UpdateTab from "./update/UpdateTab";
import { useDatabase } from "../hooks/database-hooks";
import { useEffect } from "react";
import useSafeContext from "../hooks/safe-context-hook";



function StartScreen() {
    return (
        <span className="fixed left-[40px] top-[20px] -z-50 text-6xl text-neutral-700 select-none">
            zero
        </span>
    );
}

function MainScreenContent() {
    const { navigationData, navigationDispatch } = useSafeContext(NavigationContext);

    return (
        <Tabs
            index={navigationData.tabsIndex.main}
            setIndex={(index) => { navigationDispatch({ action:"Tab Change", level: "main", tabIndex: index }); }}
            className="flex grow flex-col"
        >
            <Tab label="Update"><UpdateTab /></Tab>
            <Tab label="Library"><LibraryTab /></Tab>
            <Tab label="Configuration"><ConfigurationTab /></Tab>
        </Tabs>
    );
}


function MainScreen() {
    return (
        <DataContextProvider>
            <NavigationContextProvider>
                <MainScreenContent />
            </NavigationContextProvider>
        </DataContextProvider>
    );
}


export default function App() {
    const { path, isLoaded } = useDatabase();

    useEffect(() => {
        const handleFindEvent = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "f") {
                event.preventDefault();
            }
        };
        window.addEventListener("keydown", handleFindEvent);

        return () => {
            window.removeEventListener("keydown", handleFindEvent);
        };
    }, []);

    return (
        <>
            {isLoaded && (path === null ? <StartScreen /> : <MainScreen key={path} />)}
        </>
    );
}
