import { BsPlus } from "react-icons/bs";
import { DataContext } from "../contexts/data-context";
import Input from "./Input";
import { NavigationContext } from "../contexts/navigation-context";
import type { StorageKey } from "../data/storage";
import { Virtuoso } from "react-virtuoso";
import type { Work } from "../data/api";
import clsx from "clsx";
import useSafeContext from "../hooks/safe-context-hook";
import useSessionState from "../hooks/session-state";



type AddWorksListProps = {
    storageKey: StorageKey | string,
    creatorWorks: Work[],
    onButtonClick: (workId: number) => void
}

export default function AddWorksList({ storageKey, creatorWorks, onButtonClick }: AddWorksListProps) {
    const { works } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, setFilter] = useSessionState(storageKey, "");

    const worksItems = Array.from(works.values()).filter((work) => work.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <>
            <Input
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); } }
            />
            <Virtuoso
                className="border border-neutral-700 rounded"
                data={worksItems}
                computeItemKey={(_, work) => work.id}
                itemContent={(index, work) => {
                    const attached = creatorWorks.find((creatorWork) => creatorWork.id === work.id) !== undefined;
                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[5px] grow",
                                    "overflow-hidden whitespace-nowrap overflow-ellipsis",
                                    "hover:bg-neutral-200 active:bg-neutral-300",
                                    { "text-neutral-500": attached }
                                )}
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Work", id: work.id } }); }}
                            >{work.name}</div>
                            { !attached && <button
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400"
                                type="button"
                                onClick={() => { onButtonClick(work.id); }}
                            ><BsPlus /></button> }
                        </div>
                    );
                }}
            />
        </>
    );
}
