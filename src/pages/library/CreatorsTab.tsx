import * as data from "../../data/data";
import { Table, TableCell, TableRow } from "../../components/Table";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state-hook";



export default function CreatorsTab() {
    const { creators } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, setFilter] = useSessionState(StorageKey.LibraryCreatorsFilter, "");


    const creatorsItems = Array.from(creators.values()).filter((creator) => creator.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <Input
                    name="creators-search-input"
                    value={filter}
                    placeholder="Find"
                    type="search"
                    onChange={(event) => { setFilter(event.target.value); }}
                />
            </div>

            <Table
                sortStorageKey={StorageKey.LibraryCreatorsSort}
                data={creatorsItems}
                header={{ rows: [
                    { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                    { contents: "Name", sort: { action: "Sort", sortFnGen: data.creatorNameSortFnGen } },
                    { contents: "Works", sort: { action: "Sort", sortFnGen: data.creatorWorksSortFnGen } }
                ] }}
                computeItemKey={(_, creator) => creator.id}
                itemContent={(index, creator) => (
                    <TableRow>
                        <TableCell className="w-[1%] p-[5px]">{index + 1}.</TableCell>
                        <TableCell
                            className={clsx(
                                "max-w-0 p-[5px] overflow-hidden overflow-ellipsis",
                                "hover:bg-neutral-200 active:bg-neutral-300"
                            )}
                            title={creator.name}
                            onClick={() => {
                                navigationDispatch({action: "New", page: {id: creator.id, type: "Creator"}});
                            }}
                        >{creator.name}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px]"
                        >{creator.works.length}</TableCell>
                    </TableRow>
                )}
            />
        </div>
    );
}
