import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../../components/Tabs";
import AddWorkTab from "./AddWorkTab";
import CreatorsTab from "./CreatorsTab";
import { StorageKey } from "../../../data/storage-key";
import WorksTab from "./WorksTab";



export default function HomePage() {
    return (
        <Tabs storageKey={StorageKey.HomePageTabs} className="flex grow flex-col">
            <TabBar className="">
                <TabButton className="">Works</TabButton>
                <TabButton className="">Creators</TabButton>
                <TabButton className="">Add Work</TabButton>
                <TabButton className="">Add Creator</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><WorksTab /></Tab>
                <Tab><CreatorsTab /></Tab>
                <Tab><AddWorkTab /></Tab>
                <Tab><div>add creator</div></Tab>
            </TabsContents>
        </Tabs>
    );
}
