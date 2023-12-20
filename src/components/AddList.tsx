import { BsPlus } from "react-icons/bs";
import Input from "./Input";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";
import useSessionState from "../hooks/session-state";



type AddListItemData = {
    contents: React.ReactNode,
    onItemClick: () => void
    onButtonClick: () => void
}

type AddListProps<T> = {
    storageKey: string,
    data: T[],
    filterFn: (data: T[], filter: string) => T[],
    findFn: (item: T) => boolean,
    computeItemKey: (index: number, item: T) => React.Key,
    itemContent: (item: T) => AddListItemData
}

export default function AddList<T>(props: AddListProps<T>) {
    const [filter, setFilter] = useSessionState(props.storageKey, "");

    return (
        <>
            <Input
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); }}
            />
            <Virtuoso
                className="border border-neutral-700 rounded"
                data={props.filterFn(props.data, filter)}
                computeItemKey={props.computeItemKey}
                itemContent={(index, item) => {
                    const itemData = props.itemContent(item);
                    const added = props.findFn(item);

                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[5px] grow",
                                    "overflow-hidden whitespace-nowrap overflow-ellipsis",
                                    "hover:bg-neutral-200 active:bg-neutral-300",
                                    { "text-neutral-500": added }
                                )}
                                onClick={() => { itemData.onItemClick(); }}
                            >{itemData.contents}</div>
                            {!added && <button
                                className={clsx(
                                    "min-w-[32px] min-h-[32px] flex items-center justify-center",
                                    "hover:bg-neutral-300 active:bg-neutral-400"
                                )}
                                type="button"
                                onClick={() => { itemData.onButtonClick(); }}
                            ><BsPlus /></button>}
                        </div>
                    );
                }}
            />
        </>
    );
}
