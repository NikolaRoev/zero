import * as api from "../../api";
import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../utility/Tabs";
import { useEffect, useState } from "react";
import UpdateTab from "./update/UpdateTab";
import { listen } from "@tauri-apps/api/event";



function useDatabaseState() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        api.databaseIsOpen().then((value) => {
            setIsOpen(value);
        }).catch((reason) => { alert(reason); });

        listen(api.CLOSED_DATABASE_EVENT, () => {
            setIsOpen(false);
        }).catch(async (reason) => {
            await api.error(`Failed to listen for database closed event in Main: ${reason}`);
        });
        
        listen(api.OPENED_DATABASE_EVENT, () => {
            setIsOpen(true);
        }).catch(async (reason) => {
            await api.error(`Failed to listen for database opened event in Main: ${reason}`);
        });
    }, []);

    return { isOpen };
}


function StartScreen() {
    return <div>test</div>;
}


function MainScreen() {
    return (
        <Tabs className="flex grow flex-col">
            <TabBar>
                <TabButton>Update</TabButton>
                <TabButton>Library</TabButton>
            </TabBar>
            <TabsContents className="flex grow flex-col">
                <Tab><UpdateTab /></Tab>
                <Tab><div>library</div></Tab>
            </TabsContents>
        </Tabs>
    );
}


export default function MainApp() {
    const { isOpen } = useDatabaseState();

    return isOpen ? <MainScreen /> : <StartScreen />;
}
