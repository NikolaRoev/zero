import { type TableProps, TableVirtuoso } from "react-virtuoso";
import { Fragment } from "react";
import Input from "../../../components/Input";
import type { Work } from "../../../data/api";
import clsx from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import useFormats from "../../../hooks/formats";
import { useStatuses } from "../../../hooks/statuses";
import useTypes from "../../../hooks/types";
import { useWorks } from "../../../hooks/works";
import Select from "../../../components/Select";
import useSessionReducer from "../../../hooks/session-reducer";



function WorksTable({works}: {works: Work[]}) {
    return(
        <div className="pl-[10px] grow">
            <TableVirtuoso
                components={{
                    Table: ({ style, ...props } : TableProps) => (
                        <table
                            {...props}
                            style={{ ...style }}
                            className="w-[100%] border-[1px] border-collapse"
                        />
                    )
                }}
                data={works}
                computeItemKey={(_, work) => work.id }
                fixedHeaderContent={() => (
                    <tr className="border-[1px] bg-gray-300 border-black">
                        <th className="border-[1px] border-black"></th>
                        <th className="border-[1px] border-black">Name</th>
                        <th className="border-[1px] border-black">Progress</th>
                        <th className="border-[1px] border-black">Updated</th>
                        <th className="border-[1px] border-black">Added</th>
                    </tr>
                )}
                itemContent={(index, work) => (
                    <>
                        <td className="w-[1%] p-[5px] border-[1px] border-black">{index + 1}.</td>
                        <td title={work.name} className="max-w-0 p-[5px] border-[1px] border-black overflow-hidden whitespace-nowrap overflow-ellipsis">{work.name}</td>
                        <td className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.progress}</td>
                        <td title={formatDistanceToNowStrict(Date.parse(work.updated), { addSuffix: true })} className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.updated}</td>
                        <td title={formatDistanceToNowStrict(Date.parse(work.added), { addSuffix: true })} className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.added}</td>
                    </>
                )}
            />
        </div>
    );
}

type By = "name" | "progress";
type Filter = {
    value: string,
    by: By,
    statuses: string[],
    types: string[],
    formats: string[]
}
const emptyFilter: Filter = {
    value: "",
    by: "name",
    statuses: [],
    types: [],
    formats: []
};

type FilterAction =
    { action: "Clear" } |
    { action: "ChangeValue", value: string } |
    { action: "ChangeBy", by: By } |
    { action: "AddStatus", status: string } |
    { action: "RemoveStatus", status: string } |
    { action: "AddType", type: string } |
    { action: "RemoveType", type: string } |
    { action: "AddFormat", format: string } |
    { action: "RemoveFormat", format: string }

function filterReducer(filter: Filter, action: FilterAction): Filter {
    switch (action.action) {
        case "Clear":
            return emptyFilter;
        case "ChangeValue":
            return { ...filter, value: action.value };
        case "ChangeBy":
            return { ...filter, by: action.by };
        case "AddStatus":
            return { ...filter, statuses: [...filter.statuses, action.status] };
        case "RemoveStatus":
            return { ...filter, statuses: filter.statuses.filter((s) => s !== action.status) };
        case "AddType":
            return { ...filter, types: [...filter.types, action.type ] };
        case "RemoveType":
            return { ...filter, types: filter.types.filter((t) => t !== action.type) };
        case "AddFormat":
            return { ...filter, formats: [...filter.formats, action.format ] };
        case "RemoveFormat":
            return { ...filter, formats: filter.formats.filter((f) => f !== action.format) };
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function WorksTab() {
    const { works } = useWorks();
    const { statuses } = useStatuses();
    const { types } = useTypes();
    const { formats } = useFormats();
    const [filter, filterDispatch] = useSessionReducer("LIBRARY-FILTER", filterReducer, emptyFilter);

    
    const statusesItems = statuses.map((status) => (
        <Fragment key={status.id}>
            <input
                id={`status-${status.status}`}
                type="checkbox"
                checked={filter.statuses.includes(status.status)}
                onChange={(event) => {
                    if (event.target.checked) { filterDispatch({ action: "AddStatus", status: status.status}); }
                    else { filterDispatch({ action: "RemoveStatus", status: status.status}); }
                }}
            />
            <label
                htmlFor={`status-${status.status}`}
                title={status.is_update ? "Update status." : undefined}
                className={clsx({ "underline": status.is_update })}
            >{status.status}</label>
        </Fragment>
    ));

    const typesItems = types.map((type) => (
        <Fragment key={type.id}>
            <input
                id={`type-${type.type}`}
                type="checkbox"
                checked={filter.types.includes(type.type)}
                onChange={(event) => {
                    if (event.target.checked) { filterDispatch({ action: "AddType", type: type.type}); }
                    else { filterDispatch({ action: "RemoveType", type: type.type}); }
                }}
            />
            <label htmlFor={`type-${type.type}`}>{type.type}</label>
        </Fragment>
    ));

    const formatsItems = formats.map((format) => (
        //const id = useId();
        <Fragment key={format.id}>
            <input
                id={`format-${format.format}`}
                type="checkbox"
                checked={filter.formats.includes(format.format)}
                onChange={(event) => {
                    if (event.target.checked) { filterDispatch({ action: "AddFormat", format: format.format}); }
                    else { filterDispatch({ action: "RemoveFormat", format: format.format}); }
                }}
            />
            <label htmlFor={`format-${format.format}`}>{format.format}</label>
        </Fragment>
    ));

    const worksItems = works.filter((work) => {
        switch (filter.by) {
            case "name": {
                if (!work.name.toLowerCase().includes(filter.value.toLowerCase())) {
                    return false;
                }
                break;
            }
            case "progress": {
                if (!work.progress.toLowerCase().includes(filter.value.toLowerCase())) {
                    return false;
                }
                break;
            }
            default: {
                const unreachable: never = filter.by;
                throw new Error(`Invalid filter by value: ${unreachable}`);
            }
        }

        if (filter.statuses.length && !filter.statuses.includes(work.status)) {
            return false;
        }

        if (filter.types.length && !filter.types.includes(work.type)) {
            return false;
        }

        if (filter.formats.length && !filter.formats.includes(work.format)) {
            return false;
        }
        return true;
    });
    
    return (
        <div className="grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <Input
                    value={filter.value}
                    placeholder="Find"
                    type="search"
                    onChange={(event) => { filterDispatch({ action: "ChangeValue", value: event.target.value }); }}
                />
                <Select
                    value={filter.by}
                    items={[{ label: "Name", value: "name" }, { label: "Progress", value: "progress" }]}
                    onChange={(value: By) => { filterDispatch({ action: "ChangeBy", by: value }); }}
                />
                <fieldset>
                    <legend>Statuses</legend>{statusesItems}
                </fieldset>
                <fieldset>
                    <legend>Types</legend>{typesItems}
                </fieldset>
                <fieldset>
                    <legend>Formats</legend>{formatsItems}
                </fieldset>
                <button onClick={() => { filterDispatch({ action: "Clear"}); }}>Clear</button>
            </div>
            <WorksTable works={worksItems} />
        </div>
    );
}
