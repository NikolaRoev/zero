import { Tab, Tabs } from "../../components/Tabs";
import AddCreatorTab from "./AddCreatorTab";
import AddWorkTab from "./AddWorkTab";
import CreatorsTab from "./CreatorsTab";
import { NavigationContext } from "../../contexts/navigation-context";
import WorksTab from "./WorksTab";
import useSafeContext from "../../hooks/safe-context-hook";



export default function HomePage() {
    const { navigationData, navigationDispatch } = useSafeContext(NavigationContext);
    
    return (
        <Tabs
            index={navigationData.tabsIndex.get("Home") ?? 0}
            setIndex={(index) => { navigationDispatch({ action:"Tab Change", level: "Home", tabIndex: index }); }}
            className="flex grow flex-col"
        >
            <Tab label="Works"><WorksTab /></Tab>
            <Tab label="Creators"><CreatorsTab /></Tab>
            <Tab label="Add Work"><AddWorkTab /></Tab>
            <Tab label="Add Creator"><AddCreatorTab /></Tab>
        </Tabs>
    );
}
