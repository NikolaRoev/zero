
import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../components/Tabs";
import FormatsTab from "./FormatsTab";
import StatusesTab from "./StatusesTab";
import { StorageKey } from "../../data/storage";
import TypesTab from "./TypesTab";



export default function SettingsApp() {
    return (
        <Tabs storageKey={StorageKey.SettingsTabs} className="pt-[30px] flex grow flex-col">
            <TabBar>
                <TabButton>Statuses</TabButton>
                <TabButton>Types</TabButton>
                <TabButton>Formats</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><StatusesTab /></Tab>
                <Tab><TypesTab /></Tab>
                <Tab><FormatsTab /></Tab>
            </TabsContents>
        </Tabs>
    );
}
