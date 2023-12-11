import CreatorsTable from "../../components/CreatorsTable";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage";
import { useCreators } from "../../hooks/creators";
import useSessionState from "../../hooks/session-state";



export default function CreatorsTab() {
    const { creators } = useCreators();
    const [filter, setFilter] = useSessionState(StorageKey.LibraryCreatorsFilter, "");


    const creatorsItems = creators.filter((creator) => {
        if (!creator.name.toLowerCase().includes(filter.toLowerCase())) {
            return false;
        }

        return true;
    });
    
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
