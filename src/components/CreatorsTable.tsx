import { type TableProps, TableVirtuoso } from "react-virtuoso";
import type { Creator } from "../data/api";
import DeleteButton from "./DeleteButton";
import { NavigationContext } from "../contexts/navigation-context";
import type { StorageKey } from "../data/storage";
import clsx from "clsx";
import useSafeContext from "../hooks/safe-context-hook";
import useSessionState from "../hooks/session-state";



type Sort = {
    column: "none" | "name" | "works",
    order: boolean
}

function sortCreators(sort: Sort, creators: Creator[]): Creator[] {
    switch (sort.column) {
        case "none": {
            return creators;
        }
        case "name": {
            if (sort.order) {
                return creators.toSorted((a, b) => a.name.localeCompare(b.name));
            }
            else {
                return creators.toSorted((a, b) => b.name.localeCompare(a.name));
            }
        }
        case "works": {
            if (sort.order) {
                return creators.toSorted((a, b) => a.works - b.works);
            }
            else {
                return creators.toSorted((a, b) => b.works - a.works);
            }
        }
        default: {
            const unreachable: never = sort.column;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}


type CreatorsTableProps = {
    creators: Creator[],
    storageKey: StorageKey | string,
    headerClassName?: string,
    dataClassName?: string,
    name?: boolean,
    works?: boolean,
    onDetachCreator?: (CreatorId: number) => void,
}

export default function CreatorsTable(props: CreatorsTableProps) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [sort, setSort] = useSessionState<Sort>(props.storageKey, { column: "none", order: false });

    const sortedCreators = sortCreators(sort, props.creators);
    
    return(
        <div className="grow">
            <TableVirtuoso
                components={{
                    Table: ({ style, ...props } : TableProps) => (
                        <table
                            {...props}
                            style={{ ...style }}
                            className="w-[100%] border border-collapse"
                        />
                    )
                }}
                data={sortedCreators}
                computeItemKey={(_, creator) => creator.id }
                fixedHeaderContent={() => (
                    <tr className={clsx("bg-neutral-300 border border-neutral-700", props.headerClassName)}>
                        <th
                            className="border border-neutral-700"
                            onClick={() => { setSort({ column: "none", order: false }); }}
                        ></th>
                        {props.name && <th
                            className="border border-neutral-700"
                            onClick={() => { setSort({ column: "name", order: !sort.order }); }}
                        >Name</th>}
                        {props.works && <th
                            className="border border-neutral-700"
                            onClick={() => { setSort({ column: "works", order: !sort.order }); }}
                        >Works</th>}
                        {props.onDetachCreator && <th className="border border-neutral-700"></th>}
                    </tr>
                )}
                itemContent={(index, creator) => (
                    <>
                        <td
                            className={clsx("w-[1%] p-[5px] border border-neutral-700", props.dataClassName)}
                        >{index + 1}.</td>
                        {props.name && <td
                            className={clsx(
                                "max-w-0 p-[5px] border border-neutral-700",
                                "overflow-hidden whitespace-nowrap overflow-ellipsis",
                                "hover:bg-neutral-200 active:bg-neutral-300",
                                props.dataClassName
                            )}
                            onClick={() => { navigationDispatch({ action: "New", page: { id: creator.id, type: "Creator" }}); }}
                            title={creator.name}
                        >{creator.name}</td>}
                        {props.works && <td
                            className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                        >{creator.works}</td>}
                        {props.onDetachCreator && <td className="p-0 w-[1%] border border-neutral-700">
                            <DeleteButton
                                onClick={() => { if(props.onDetachCreator) { props.onDetachCreator(creator.id); } }}
                                title={`Detach creator "${creator.name}".`}
                            />
                        </td>}
                    </>
                )}
            />
        </div>
    );
}
