import * as api from "../data/api";
import * as event from "../data/events";
import { Tab, Tabs } from "../components/Tabs";
import { useDatabase, useRecentDatabases } from "../hooks/database-hooks";
import ConfigurationTab from "./configuration/ConfigurationTab";
import DataContextProvider from "../contexts/data-context";
import Dialog from "../components/Dialog";
import LibraryTab from "./library/LibraryTab";
import RemoveList from "../components/RemoveList";
import { StorageKey } from "../data/storage";
import UpdateTab from "./update/UpdateTab";
import clsx from "clsx";
import { message } from "@tauri-apps/api/dialog";
import { useState } from "react";
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
            className="w-[50vw] h-[60vh]"
            isOpen={isOpen}
            onClose={() => { setIsOpen(false); }}
        ><RecentDatabasesList /></Dialog>
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
    return (
        <DataContextProvider>
            <Tabs storageKey={StorageKey.MainScreenTabs} className="flex grow flex-col">
                <Tab label="Update"><UpdateTab /></Tab>
                <Tab label="Library"><LibraryTab /></Tab>
                <Tab label="Configuration"><ConfigurationTab /></Tab>
            </Tabs>
        </DataContextProvider>
    );
}


export default function App() {
    const { path } = useDatabase();

    return (
        <>
            {path === null ? <StartScreen /> : <MainScreen key={path} />}
            <MoreRecentDatabasesDialog />
        </>
    );
}
