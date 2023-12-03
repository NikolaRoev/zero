import NavigationContextProvider, { NavigationContext } from "../../contexts/navigation-context";
import CreatorPage from "./CreatorPage";
import HomePage from "./HomePage";
import { StorageKey } from "../../data/storage";
import WorkPage from "./WorkPage";
import useSafeContext from "../../hooks/safe-context-hook";



function LibraryPage() {
    const { navigationData } = useSafeContext(NavigationContext);

    const contents = () => {
        const page = navigationData.pages[navigationData.index];
        switch (page?.type) {
            case "Home": return <HomePage />;
            case "Work": return <WorkPage id={page.id} />;
            case "Creator": return <CreatorPage id={page.id} />;
            case undefined: return <div>ERROR</div>;
            default: {
                const unreachable: never = page;
                throw new Error(`Invalid page: ${unreachable}`);
            }
        }
    };

    return contents();
}

export default function LibraryTab() {
    return (
        <NavigationContextProvider storageKey={StorageKey.LibraryNavigation}>
            <LibraryPage />
        </NavigationContextProvider>
    );
}
