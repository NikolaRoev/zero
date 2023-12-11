import * as api from "../data/api";
import * as e from "../data/events";
import { type Event, type UnlistenFn, listen } from "@tauri-apps/api/event";
import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../components/Tabs";
import { useEffect, useState } from "react";
import DeleteButton from "../components/DeleteButton";
import LibraryTab from "./library/LibraryTab";
import SettingsApp from "./settings/SettingsApp";
import { StorageKey } from "../data/storage";
import UpdateTab from "./update/UpdateTab";



function useDatabase() {
    const [path, setPath] = useState<string | null>(null);

    useEffect(() => {
        api.databasePath().then((value) => {
            setPath(value);
        }).catch((reason) => { alert(reason); });

        const closedUnlisten = listen(e.CLOSED_DATABASE_EVENT, () => {
            setPath(null);
        }).catch((reason) => {
            api.error(`Failed to listen for database closed event in Main: ${reason}`);
        });
        
        const openUnlisten = listen(e.OPENED_DATABASE_EVENT, (event: Event<string>) => {
            sessionStorage.clear();
            setPath(event.payload);
        }).catch((reason) => {
            api.error(`Failed to listen for database opened event in Main: ${reason}`);
        });

        return () => {
            closedUnlisten.then((f: UnlistenFn) => { f(); }).catch((reason) => {
                api.error(`Failed to unlisten for database closed event in Main: ${reason}`);
            });

            openUnlisten.then((f: UnlistenFn) => { f(); }).catch((reason) => {
                api.error(`Failed to unlisten for database opened event in Main: ${reason}`);
            });
        };
    }, []);

    return { path };
}


function StartScreen() {
    const [recentDatabases, setRecentDatabases] = useState<string[]>([]);

    useEffect(() => {
        api.getRecentDatabases().then((value) => {
            setRecentDatabases(value);
        }).catch((reason) => {
            api.error(`Failed to get recent databases in Start: ${reason}`);
        });
    }, []);

    function openDatabase(path: string) {
        api.openDatabase(path).catch((reason) => { alert(reason); });
    }

    const recentDatabasesItems = recentDatabases.map((value, index) => (
        <div key={value} className="flex">
            <div
                className="hover:bg-gray-400 active:bg-gray-600 select-none"
                onClick={() => { openDatabase(value); }}
            >{index + 1}. {value}</div>
            <DeleteButton
                onClick={() => {
                    api.removeRecentDatabase(value).then(() => {
                        setRecentDatabases(recentDatabases.filter((path) => path !== value));
                    }).catch((reason) => { alert(reason); });
                }}
                title={`Remove recent database "${value}".`}
            />
        </div>
        
    ));

    return (
        <div className="flex flex-col grow">
            {recentDatabasesItems}
        </div>
    );
}


function MainScreen() {
    return (
        <Tabs storageKey={StorageKey.MainScreenTabs} className="flex grow flex-col">
            <TabBar>
                <TabButton>Update</TabButton>
                <TabButton>Library</TabButton>
                <TabButton>Configuration</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><UpdateTab /></Tab>
                <Tab><LibraryTab /></Tab>
                <Tab><SettingsApp /></Tab>
            </TabsContents>
        </Tabs>
    );
}


export default function App() {
    const { path } = useDatabase();

    return path === null ? <StartScreen /> : <MainScreen key={path} />;
}
