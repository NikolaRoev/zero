
import { Tab, Tabs } from "../../components/Tabs";
import FormatsTab from "./FormatsTab";
import StatusesTab from "./StatusesTab";
import { StorageKey } from "../../data/storage";
import TypesTab from "./TypesTab";



export default function ConfigurationTab() {
    return (
        <Tabs storageKey={StorageKey.ConfigurationTabs} className="pt-[30px] flex grow flex-col">
            <Tab label="Statuses"><StatusesTab /></Tab>
            <Tab label="Types"><TypesTab /></Tab>
            <Tab label="Formats"><FormatsTab /></Tab>
        </Tabs>
    );
}
