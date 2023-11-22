import * as api from "../../api";
import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../utility/Tabs";
import { type UnlistenFn, listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import LibraryTab from "./library/LibraryTab";
import UpdateTab from "./update/UpdateTab";



function useDatabaseState() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        api.databaseIsOpen().then((value) => {
            setIsOpen(value);
        }).catch((reason) => { alert(reason); });

        const closedUnlisten = listen(api.CLOSED_DATABASE_EVENT, () => {
            setIsOpen(false);
        }).catch(async (reason) => {
            await api.error(`Failed to listen for database closed event in Main: ${reason}`);
        });
        
        const openUnlisten = listen(api.OPENED_DATABASE_EVENT, () => {
            setIsOpen(true);
        }).catch(async (reason) => {
            await api.error(`Failed to listen for database opened event in Main: ${reason}`);
        });

        return () => {
            closedUnlisten.then((f: UnlistenFn) => { f(); }).catch(async (reason) => {
                await api.error(`Failed to unlisten for database closed event in Main: ${reason}`);
            });

            openUnlisten.then((f: UnlistenFn) => { f(); }).catch(async (reason) => {
                await api.error(`Failed to unlisten for database opened event in Main: ${reason}`);
            });
        };
    }, []);

    return { isOpen };
}


function StartScreen() {
    return <div>test</div>;
}


function MainScreen() {
    return (
        <Tabs className="flex grow flex-col">
            <TabBar className="">
                <TabButton className="">Update</TabButton>
                <TabButton className="">Library</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><UpdateTab /></Tab>
                <Tab><LibraryTab /></Tab>
            </TabsContents>
        </Tabs>
    );
}


export default function MainApp() {
    const { isOpen } = useDatabaseState();

    return isOpen ? <MainScreen /> : <StartScreen />;
}
