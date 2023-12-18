import { BsPlus } from "react-icons/bs";
import type { Creator } from "../data/api";
import { DataContext } from "../contexts/data-context";
import Input from "./Input";
import { NavigationContext } from "../contexts/navigation-context";
import type { StorageKey } from "../data/storage";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";
import useSafeContext from "../hooks/safe-context-hook";
import useSessionState from "../hooks/session-state";



type AddCreatorsListProps = {
    storageKey: StorageKey | string,
    workCreators: Creator[],
    onButtonClick: (creatorId: number) => void
}

export default function AddCreatorsList({ storageKey, workCreators, onButtonClick }: AddCreatorsListProps) {
    const { creators } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, setFilter] = useSessionState(storageKey, "");

    const creatorsItems = Array.from(creators.values()).filter((creator) => creator.name.toLowerCase().includes(filter.toLowerCase()));
    
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
                data={creatorsItems}
                computeItemKey={(_, creator) => creator.id}
                itemContent={(index, creator) => {
                    const attached = workCreators.find((workCreator) => workCreator.id === creator.id) !== undefined;
                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[5px] grow",
                                    "overflow-hidden whitespace-nowrap overflow-ellipsis",
                                    "hover:bg-neutral-200 active:bg-neutral-300",
                                    { "text-neutral-500": attached }
                                )}
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: creator.id } }); }}
                            >{creator.name}</div>
                            { !attached && <button
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400"
                                type="button"
                                onClick={() => { onButtonClick(creator.id); }}
                            ><BsPlus /></button> }
                        </div>
                    );
                }}
            />
        </>
    );
}
