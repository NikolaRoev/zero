import * as api from "../data/api";
import { Tab, Tabs } from "../components/Tabs";
import { useDatabasePath, useRecentDatabases } from "../hooks/database-hook";
import ConfigurationTab from "./settings/ConfigurationTab";
import DataContextProvider from "../contexts/data-context";
import DeleteButton from "../components/DeleteButton";
import LibraryTab from "./library/LibraryTab";
import { StorageKey } from "../data/storage";
import UpdateTab from "./update/UpdateTab";
import clsx from "clsx";



function StartScreen() {
    const { recentDatabases, setRecentDatabases } = useRecentDatabases();

    
    function openDatabase(path: string) {
        api.openDatabase(path).catch((reason) => { alert(reason); });
    }


    const recentDatabasesItems = recentDatabases.map((value, index) => (
        <div key={value} className={clsx("flex", { "bg-neutral-100": index % 2 })}>
            <div className="p-[5px]">{index + 1}.</div>
            <div
                className="p-[5px] overflow-hidden whitespace-nowrap overflow-ellipsis grow hover:bg-neutral-200 active:bg-neutral-300"
                onClick={() => { openDatabase(value); }}
                title={value}
            >{value}</div>
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
        <div className="translate-x-1/2 translate-y-1/2 w-1/2 h-1/2 flex flex-col border border-neutral-700 rounded">
            <label className="p-[5px] border-b border-neutral-700"> Open Recent Databases:</label>
            <div className="flex flex-col rounded overflow-y-auto select-none">
                {recentDatabasesItems}
            </div>
        </div>
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
    const { path } = useDatabasePath();

    return path === null ? <StartScreen /> : <MainScreen key={path} />;
}
