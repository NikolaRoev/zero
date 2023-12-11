import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../components/Tabs";
import AddCreatorTab from "./AddCreatorTab";
import AddWorkTab from "./AddWorkTab";
import CreatorsTab from "./CreatorsTab";
import { StorageKey } from "../../data/storage";
import WorksTab from "./WorksTab";



export default function HomePage() {
    return (
        <Tabs storageKey={StorageKey.HomePageTabs} className="flex grow flex-col">
            <TabBar>
                <TabButton>Works</TabButton>
                <TabButton>Creators</TabButton>
                <TabButton>Add Work</TabButton>
                <TabButton>Add Creator</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><WorksTab /></Tab>
                <Tab><CreatorsTab /></Tab>
                <Tab><AddWorkTab /></Tab>
                <Tab><AddCreatorTab /></Tab>
            </TabsContents>
        </Tabs>
    );
}
