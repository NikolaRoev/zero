import { type TableProps, TableVirtuoso } from "react-virtuoso";
import DeleteButton from "./DeleteButton";
import { NavigationContext } from "../contexts/navigation-context";
import { StorageKey } from "../data/storage";
import type { Work } from "../data/api";
import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import useSafeContext from "../hooks/safe-context-hook";
import useSessionState from "../hooks/session-state";



type Sort = {
    column: "none" | "name" | "progress" | "status" | "type" | "format" | "updated" | "added",
    order: boolean
}

function sortWorks(sort: Sort, works: Work[]): Work[] {
    switch (sort.column) {
        case "none": {
            return works;
        }
        case "name": {
            if (sort.order) {
                return works.toSorted((a, b) => a.name.localeCompare(b.name));
            }
            else {
                return works.toSorted((a, b) => b.name.localeCompare(a.name));
            }
        }
        case "progress": {
            if (sort.order) {
                return works.toSorted((a, b) => {
                    const numB = Number(b.progress) || Number.POSITIVE_INFINITY;
                    const numA = Number(a.progress) || Number.POSITIVE_INFINITY;
                    return numA - numB;
                });
            }
            else {
                return works.toSorted((a, b) => {
                    const numB = Number(b.progress) || Number.NEGATIVE_INFINITY;
                    const numA = Number(a.progress) || Number.NEGATIVE_INFINITY;
                    return numB - numA;
                });
            }
        }
        case "status": {
            if (sort.order) {
                return works.toSorted((a, b) => a.status.localeCompare(b.status));
            }
            else {
                return works.toSorted((a, b) => b.status.localeCompare(a.status));
            }
        }
        case "type": {
            if (sort.order) {
                return works.toSorted((a, b) => a.type.localeCompare(b.type));
            }
            else {
                return works.toSorted((a, b) => b.type.localeCompare(a.type));
            }
        }
        case "format": {
            if (sort.order) {
                return works.toSorted((a, b) => a.format.localeCompare(b.format));
            }
            else {
                return works.toSorted((a, b) => b.format.localeCompare(a.format));
            }
        }
        case "updated": {
            if (sort.order) {
                return works.toSorted((a, b) => Date.parse(b.updated) - Date.parse(a.updated));
            }
            else {
                return works.toSorted((a, b) => Date.parse(a.updated) - Date.parse(b.updated));
            }
        }
        case "added": {
            if (sort.order) {
                return works.toSorted((a, b) => Date.parse(b.added) - Date.parse(a.added));
            }
            else {
                return works.toSorted((a, b) => Date.parse(a.added) - Date.parse(b.added));
            }
        }
        default: {
            const unreachable: never = sort.column;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}


type WorksTableProps = {
    works: Work[],
    storageKey: StorageKey | string,
    headerClassName?: string,
    dataClassName?: string,
    name?: boolean,
    progress?: boolean,
    status?: boolean,
    type?: boolean,
    format?: boolean,
    updated?: boolean,
    added?: boolean,
    onDetachWork?: (workId: number) => void,
}

export default function WorksTable(props: WorksTableProps) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [sort, setSort] = useSessionState<Sort>(props.storageKey, { column: "none", order: false });

    const sortedWorks = sortWorks(sort, props.works);

    return(
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
            data={sortedWorks}
            computeItemKey={(_, work) => work.id }
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
                    {props.progress && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "progress", order: !sort.order }); }}
                    >Progress</th>}
                    {props.status && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "status", order: !sort.order }); }}
                    >Status</th>}
                    {props.type && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "type", order: !sort.order }); }}
                    >Type</th>}
                    {props.format && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "format", order: !sort.order }); }}
                    >Format</th>}
                    {props.updated && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "updated", order: !sort.order }); }}
                    >Updated</th>}
                    {props.added && <th
                        className="border border-neutral-700"
                        onClick={() => { setSort({ column: "added", order: !sort.order }); }}
                    >Added</th>}
                    {props.onDetachWork && <th className="border border-neutral-700"></th>}
                </tr>
            )}
            itemContent={(index, work) => (
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
                        onClick={() => { navigationDispatch({action: "New", page: {id: work.id, type: "Work"}}); }}
                        title={work.name}
                    >{work.name}</td>}
                    {props.progress && <td
                        className={clsx(
                            "max-w-0 w-[1%] p-[5px] border border-neutral-700",
                            "overflow-hidden whitespace-nowrap overflow-ellipsis",
                            props.dataClassName
                        )}
                        title={work.progress}
                    >{work.progress}</td>}
                    {props.status && <td
                        className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                    >{work.status}</td>}
                    {props.type && <td
                        className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                    >{work.type}</td>}
                    {props.format && <td
                        className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                    >{work.format}</td>}
                    {props.updated && <td
                        className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                        title={work.updated}
                    >{formatDistanceToNowStrict(Date.parse(work.updated), { addSuffix: true })}</td>}
                    {props.added && <td
                        className={clsx("w-[1%] p-[5px] border border-neutral-700 whitespace-nowrap", props.dataClassName)}
                        title={work.added}
                    >{formatDistanceToNowStrict(Date.parse(work.added), { addSuffix: true })}</td>}
                    {props.onDetachWork && <td className="p-0 w-[1%] border border-neutral-700">
                        <DeleteButton
                            onClick={() => { if(props.onDetachWork) { props.onDetachWork(work.id); } }}
                            title={`Detach work "${work.name}".`}
                        />
                    </td>}
                </>
            )}
        />
    );
}
