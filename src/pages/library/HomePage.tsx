import { Tab, Tabs } from "../../components/Tabs";
import AddCreatorTab from "./AddCreatorTab";
import AddWorkTab from "./AddWorkTab";
import CreatorsTab from "./CreatorsTab";
import { StorageKey } from "../../data/storage";
import WorksTab from "./WorksTab";



export default function HomePage() {
    return (
        <Tabs storageKey={StorageKey.HomePageTabs} className="flex grow flex-col">
            <Tab label="Works"><WorksTab /></Tab>
            <Tab label="Creators"><CreatorsTab /></Tab>
            <Tab label="Add Work"><AddWorkTab /></Tab>
            <Tab label="Add Creator"><AddCreatorTab /></Tab>
        </Tabs>
    );
}
