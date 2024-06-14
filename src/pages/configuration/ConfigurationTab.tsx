
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
            index={navigationData.tabsIndex.get("Config") ?? 0}
            setIndex={(index) => { navigationDispatch({ action:"Tab Change", level: "Config", tabIndex: index }); }}
            className="pt-[30px] flex grow flex-col"
        >
            <Tab label="Statuses"><StatusesTab /></Tab>
            <Tab label="Types"><TypesTab /></Tab>
            <Tab label="Formats"><FormatsTab /></Tab>
        </Tabs>
    );
}
