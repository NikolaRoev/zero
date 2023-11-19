import Tabs, { Tab, TabBar, TabButton, TabsContents } from "../../utility/Tabs";
import UpdateTab from "./update/UpdateTab";



export default function MainApp() {
    return (
        <Tabs className="flex grow flex-col">
            <TabBar>
                <TabButton>Update</TabButton>
                <TabButton>Library</TabButton>
            </TabBar>
            <TabsContents className="flex grow flex-col">
                <Tab><UpdateTab /></Tab>
                <Tab><div>library</div></Tab>
            </TabsContents>
        </Tabs>
    );
}
