import Tabs, { Tab, TabBar, TabButton, TabsContents } from "../../utility/Tabs";
import FormatsTab from "./FormatsTab";
import StatusesTab from "./StatusesTab";
import TypesTab from "./TypesTab";



export default function SettingsApp() {
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
