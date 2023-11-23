import { Tab, TabBar, TabButton, Tabs, TabsContents } from "../../../utility/Tabs";
import WorksTab from "./WorksTab";



export default function HomePage() {
    return (
        <Tabs className="flex grow flex-col">
            <TabBar className="">
                <TabButton className="">Works</TabButton>
                <TabButton className="">Creators</TabButton>
                <TabButton className="">Add Work</TabButton>
                <TabButton className="">Add Creator</TabButton>
            </TabBar>
            <TabsContents>
                <Tab><WorksTab /></Tab>
                <Tab><div>creators</div></Tab>
                <Tab><div>add work</div></Tab>
                <Tab><div>add creator</div></Tab>
            </TabsContents>
        </Tabs>
    );
}
