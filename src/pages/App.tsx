import * as api from "../data/api";
import * as event from "../data/events";
import NavigationContextProvider, { NavigationContext } from "../contexts/navigation-context";
import { Tab, Tabs } from "../components/Tabs";
import { useDatabase, useRecentDatabases } from "../hooks/database-hooks";
import { useEffect, useState } from "react";
import { BsX } from "react-icons/bs";
import ConfigurationTab from "./configuration/ConfigurationTab";
import DataContextProvider from "../contexts/data-context";
import Dialog from "../components/Dialog";
import LibraryTab from "./library/LibraryTab";
import RemoveList from "../components/RemoveList";
import UpdateTab from "./update/UpdateTab";
import clsx from "clsx";
import { message } from "@tauri-apps/api/dialog";
import useSafeContext from "../hooks/safe-context-hook";
import useTauriEvent from "../hooks/tauri-event-hook";



function RecentDatabasesList() {
    const { recentDatabases } = useRecentDatabases();

    return (
        <RemoveList
            data={recentDatabases}
            computeItemKey={(_, recentDatabase) => recentDatabase }
            itemContent={(index, recentDatabase) => ({
                contents: (
                    <>
                        <div className="p-[5px]">{index + 1}.</div>
                        <div
                            className={clsx(
                                "grow p-[5px] overflow-hidden whitespace-nowrap overflow-ellipsis",
                                "hover:bg-neutral-200 active:bg-neutral-300"
                            )}
                            title={recentDatabase}
                            onClick={() => {
                                api.openDatabase(recentDatabase).catch(async (reason: string) => {
                                    await message(reason, { title: "Failed to open database.", type: "error" });
                                });
                            }}
                        >{recentDatabase}</div>
                    </>
                ),
                buttonTitle: `Remove recent database "${recentDatabase}".`,
                onButtonClick: () => {
                    api.removeRecentDatabase(recentDatabase).catch(async (reason: string) => {
                        await message(reason, { title: "Failed to remove recent database.", type: "error" });
                    });
                }
            })}
        />
    );
}


function MoreRecentDatabasesDialog() {
    const [isOpen, setIsOpen] = useState(false);
    

    useTauriEvent(event.MORE_RECENT_DATABASES_EVENT, () => {
        setIsOpen(true);
    });

    useTauriEvent(event.OPENED_DATABASE_EVENT, () => {
        setIsOpen(false);
    });
    

    return (
        <Dialog
            isOpen={isOpen}
            onClose={() => { setIsOpen(false); }}
        >
            <div className="w-[50vw] h-[60vh] flex flex-col border border-neutral-700 rounded">
                <div className="border-b border-neutral-700">
                    <button
                        className={clsx(
                            "ml-auto w-[24px] h-[24px]",
                            "flex justify-center items-center",
                            "hover:bg-neutral-200 active:bg-neutral-300 rounded"
                        )}
                        onClick={() => { setIsOpen(false); }}
                    ><BsX /></button>
                </div>
                <RecentDatabasesList />
            </div>
        </Dialog>
    );
}


function StartScreen() {
    return (
        <>
            <span className="fixed left-[40px] top-[20px] -z-50 text-6xl text-neutral-700 select-none">
                zero
            </span>
            <div className="translate-x-1/2 translate-y-1/2 w-1/2 h-1/2 flex flex-col border border-neutral-700 rounded">
                <span className="p-[5px] border-b border-neutral-700"> Open Recent Databases:</span>
                <RecentDatabasesList />
            </div>
        </>
    );
}


function MainScreen() {
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
        <DataContextProvider>
            <NavigationContextProvider>
                {isLoaded && (path === null ? <StartScreen /> : <MainScreen key={path} />)}
                <MoreRecentDatabasesDialog />
            </NavigationContextProvider>
        </DataContextProvider>
    );
}
