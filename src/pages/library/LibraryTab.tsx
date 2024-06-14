import CreatorPage from "./CreatorPage";
import HomePage from "./HomePage";
import NavBar from "../../components/NavButton";
import { NavigationContext } from "../../contexts/navigation-context";
import WorkPage from "./WorkPage";
import useSafeContext from "../../hooks/safe-context-hook";



function LibraryPage() {
    const { navigationData } = useSafeContext(NavigationContext);

    const contents = () => {
        if (navigationData.index === -1) {
            return <HomePage />;
        }

        const page = navigationData.pages[navigationData.index];
        switch (page?.type) {
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
        <div className="grow flex flex-col">
            <NavBar />
            <LibraryPage />
        </div>
    );
}
