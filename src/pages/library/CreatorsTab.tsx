import * as data from "../../data/data";
import { type ComparatorType, SearchInput } from "../../components/SearchInput";
import { Table, TableCell, TableRow } from "../../components/Table";
import { DataContext } from "../../contexts/data-context";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state-hook";
import { useState } from "react";



export default function CreatorsTab() {
    const { creators } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, setFilter] = useSessionState<{ value: string, comparatorType: ComparatorType }>(
        StorageKey.LibraryCreatorsFilter, { value: "", comparatorType: "None" }
    );
    const [comparator, setComparator] = useState<(value: string) => boolean>(() => () => false);

    const creatorsItems = Array.from(creators.values()).filter((creator) => comparator(creator.name));
    
    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <SearchInput
                    setComparator={setComparator}
                    filter={filter.value}
                    comparatorType={filter.comparatorType}
                    setComparatorType={(newComparatorType) => { setFilter({ ...filter, comparatorType: newComparatorType }); } }
                    name="creators-search-input"
                    onChange={(event) => { setFilter({ ...filter, value: event.target.value }); }}
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
