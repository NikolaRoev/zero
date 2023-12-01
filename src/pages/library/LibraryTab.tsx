import NavigationContextProvider, { NavigationContext } from "../../contexts/navigation-context";
import HomePage from "./HomePage";
import useSafeContext from "../../hooks/safe-context-hook";
import WorkPage from "./WorkPage";
import CreatorPage from "./CreatorPage";



function LibraryPage() {
    const { navigationData, dispatch } = useSafeContext(NavigationContext);

    const contents = () => {
        const page = navigationData.pages[navigationData.index];
        switch (page?.type) {
            case "Home": return <HomePage />;
            case "Work": return <WorkPage id={page.id} />;
            case "Creator": return <CreatorPage id={page.id} />;
            default: return <div>ERROR</div>;
        }
    };

    return (
        <>
            <div className="flex">
                <button onClick={() => { dispatch({action: "Home" }); }}>HOME</button>
                <button onClick={() => { dispatch({action: "Back" }); }}>BACK</button>
                <button onClick={() => { dispatch({action: "Forward" }); }}>FORWARD</button>
            </div>
            {contents()}
        </>
    );
}

export default function LibraryTab() {
    return (
        <NavigationContextProvider>
            <LibraryPage />
        </NavigationContextProvider>
    );
}
