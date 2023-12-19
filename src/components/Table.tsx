import { TableVirtuoso, type TableProps as VirtuosoTableProps } from "react-virtuoso";
import clsx from "clsx";
import useSessionState from "../hooks/session-state";



type Sort = {
    index: number,
    ascending: boolean
}


type HeaderRowData<T> = {
    contents: React.ReactNode,
    className?: string,
    title?: string,
    sort?:
        { action: "Sort", sortFnGen: (ascending: boolean) => (a: T, b: T) => number } |
        { action: "Clear" }
}

type HeaderData<T> = {
    className?: string,
    rows: HeaderRowData<T>[]
}


type TableCellProps = {
    children: React.ReactNode,
    className?: string,
    title?: string,
    onClick?: () => void
}

export function TableCell(props: TableCellProps) {
    return (
        <td
            className={clsx("border border-neutral-700 whitespace-nowrap", props.className)}
            title={props.title}
            onClick={props.onClick}
        >{props.children}</td>
    );
}


type TableRowProps = {
    children: React.ReactElement<TableCellProps> | React.ReactElement<TableCellProps>[]
}

export function TableRow(props: TableRowProps) {
    return <>{props.children}</>;
}


type TableProps<T> = {
    sortStorageKey: string,
    data: T[],
    computeItemKey: (index: number, item: T) => React.Key,
    header: HeaderData<T>,
    itemContent: (index: number, item: T) => React.ReactElement<TableRowProps>
}

export function Table<T>(props: TableProps<T>) {
    const [sort, setSort] = useSessionState<Sort | null>(props.sortStorageKey, null);

    const sortedData = [...props.data];
    if (sort) {
        const rowSort = props.header.rows[sort.index]?.sort;
        if (rowSort?.action === "Sort") {
            const sortFunction = rowSort.sortFnGen(sort.ascending);
            sortedData.sort(sortFunction);
        }
    }

    return(
        <TableVirtuoso
            components={{
                Table: ({ style, ...props } : VirtuosoTableProps) => (
                    <table
                        {...props}
                        style={{ ...style }}
                        className="w-[100%] border border-collapse"
                    />
                )
            }}
            data={sortedData}
            computeItemKey={props.computeItemKey}
            fixedHeaderContent={() => (
                <tr className={clsx("bg-neutral-300 border border-neutral-700", props.header.className)}>
                    {props.header.rows.map((row, index) => {
                        let handleClick = undefined;
                        if (row.sort) {
                            if (row.sort.action === "Sort") {
                                const newSort: Sort = {
                                    index: index,
                                    ascending: sort?.index !== index ? true : !sort.ascending
                                };
                                handleClick = () => { setSort(newSort); };
                            }
                            else {
                                handleClick = () => { setSort(null); };
                            }
                        }

                        return (
                            <th
                                key={index}
                                className={clsx(
                                    "border border-neutral-700",
                                    { "hover:bg-neutral-400 active:bg-neutral-500": row.sort },
                                    row.className
                                )}
                                title={row.title}
                                onClick={handleClick}
                            >
                                <div className="flex">
                                    <span className="px-[5px] grow">{row.contents}</span>
                                    {row.sort?.action === "Sort" && sort?.index === index && (sort.ascending ?
                                        <div className="self-end">▲</div> :
                                        <div className="self-end">▼</div>
                                    )}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            )}
            itemContent={props.itemContent}
        />
    );
}
