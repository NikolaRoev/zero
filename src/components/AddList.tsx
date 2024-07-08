import { type ComparatorType, SearchInput } from "./SearchInput";
import { BsPlus } from "react-icons/bs";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";
import useSessionState from "../hooks/session-state-hook";
import { useState } from "react";



type AddListItemData = {
    contents: React.ReactNode,
    onItemClick: () => void
    onButtonClick: () => void
}

type AddListProps<T> = {
    inputName?: string,
    storageKey: string,
    data: T[],
    filterFn: (data: T[], comparator: (value: string) => boolean) => T[],
    findFn: (item: T) => boolean,
    computeItemKey: (index: number, item: T) => React.Key,
    itemContent: (item: T) => AddListItemData
}

export default function AddList<T>(props: AddListProps<T>) {
    const [filter, setFilter] = useSessionState<{ value: string, comparatorType: ComparatorType, editDistance: number }>(
        props.storageKey, { value: "", comparatorType: "None", editDistance: 5 }
    );
    const [comparator, setComparator] = useState<(value: string) => boolean>(() => () => false);

    return (
        <>
            <SearchInput
                setComparator={setComparator}
                filter={filter.value}
                comparatorType={filter.comparatorType}
                setComparatorType={(newComparatorType) => { setFilter({ ...filter, comparatorType: newComparatorType }); }}
                editDistance={filter.editDistance}
                setEditDistance={(editDistance) => { setFilter({ ...filter, editDistance: editDistance }); }}
                name={props.inputName}
                onChange={(event) => { setFilter({ ...filter, value: event.target.value }); }}
                className="grow"
            />
            <Virtuoso
                className="border border-neutral-700 rounded"
                data={props.filterFn(props.data, comparator)}
                computeItemKey={props.computeItemKey}
                itemContent={(index, item) => {
                    const itemData = props.itemContent(item);
                    const added = props.findFn(item);

                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[7px] grow",
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
