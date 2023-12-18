import CreatorsTable from "../../components/CreatorsTable";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";



export default function CreatorsTab() {
    const { creators } = useSafeContext(DataContext);
    const [filter, setFilter] = useSessionState(StorageKey.LibraryCreatorsFilter, "");


    const creatorsItems = Array.from(creators.values()).filter((creator) => creator.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <Input
                    value={filter}
                    placeholder="Find"
                    type="search"
                    onChange={(event) => { setFilter(event.target.value); }}
                />
            </div>
            <CreatorsTable
                creators={creatorsItems}
                storageKey={StorageKey.LibraryCreatorsSort}
                name
                works
            />
        </div>
    );
}
