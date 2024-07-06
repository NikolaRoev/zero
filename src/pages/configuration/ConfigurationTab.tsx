
import { Tab, Tabs } from "../../components/Tabs";
import FormatsTab from "./FormatsTab";
import { NavigationContext } from "../../contexts/navigation-context";
import StatusesTab from "./StatusesTab";
import TypesTab from "./TypesTab";
import useSafeContext from "../../hooks/safe-context-hook";



export default function ConfigurationTab() {
    const { navigationData, navigationDispatch } = useSafeContext(NavigationContext);
    
    return (
        <Tabs
            index={navigationData.tabsIndex.config}
            setIndex={(index) => { navigationDispatch({ action:"Tab Change", level: "config", tabIndex: index }); }}
            className="pt-[30px] flex grow flex-col"
        >
            <Tab label="Statuses"><StatusesTab /></Tab>
            <Tab label="Types"><TypesTab /></Tab>
            <Tab label="Formats"><FormatsTab /></Tab>
        </Tabs>
    );
}
