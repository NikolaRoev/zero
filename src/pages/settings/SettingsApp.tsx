import * as api from "../../api";
import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../utility/Tabs";
import FormatsTab from "./FormatsTab";
import StatusesTab from "./StatusesTab";
import TypesTab from "./TypesTab";
import { appWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";



export default function SettingsApp() {
    useEffect(() => {
        listen(api.CLOSED_DATABASE_EVENT, () => {
            appWindow.close().catch(async (reason) => {
                await api.error(`Failed to close settings on database closed event: ${reason}.`);
            });
        }).catch(async (reason) => {
            await api.error(`Failed to listen for database closed event in Settings: ${reason}`);
        });
    }, []);


    return (
        <Tabs className="flex grow flex-col">
            <TabBar>
                <TabButton>Statuses</TabButton>
                <TabButton>Types</TabButton>
                <TabButton>Formats</TabButton>
            </TabBar>
            <TabsContents className="flex grow flex-col">
                <Tab><StatusesTab /></Tab>
                <Tab><TypesTab /></Tab>
                <Tab><FormatsTab /></Tab>
            </TabsContents>
        </Tabs>
    );
}
