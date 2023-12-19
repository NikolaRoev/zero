import * as sort from "../../utility/sortingFunctions";
import { Option, Select } from "../../components/Select";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075 } from "date-fns";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import { Fragment } from "react";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer";



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
    const { works, statuses, types, formats } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, filterDispatch] = useSessionReducer(StorageKey.LibraryWorksFilter, filterReducer, emptyFilter);

    
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
                title={status.isUpdate ? "Update status." : undefined}
                className={clsx({ "underline": status.isUpdate })}
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

    const worksItems = Array.from(works.values()).filter((work) => {
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
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col gap-y-[5px]">
                <div className="flex gap-x-[3px]">
                    <Input
                        className="grow"
                        value={filter.value}
                        placeholder="Find"
                        type="search"
                        onChange={(event) => { filterDispatch({ action: "ChangeValue", value: event.target.value }); }}
                    />
                    <Select
                        value={filter.by}
                        onChange={(value: By) => { filterDispatch({ action: "ChangeBy", by: value }); }}
                        selectMsg="Find By"
                    >
                        <Option value={"name"}>Name</Option>
                        <Option value={"progress"}>Progress</Option>
                    </Select>
                    <Button onClick={() => { filterDispatch({ action: "Clear"}); }}>Clear</Button>
                </div>
                <div className="flex gap-x-[5px]">
                    <fieldset className="grow p-[5px] border border-neutral-700 rounded-[5px] flex gap-x-[5px]">
                        <legend>Statuses</legend>{statusesItems}
                    </fieldset>
                    <fieldset className="grow p-[5px] border border-neutral-700 rounded-[5px] flex gap-x-[5px]">
                        <legend>Types</legend>{typesItems}
                    </fieldset>
                    <fieldset className="grow p-[5px] border border-neutral-700 rounded-[5px] flex gap-x-[5px]">
                        <legend>Formats</legend>{formatsItems}
                    </fieldset>
                </div>
            </div>

            <Table
                sortStorageKey={StorageKey.LibraryWorksSort}
                data={worksItems}
                header={{ rows: [
                    { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                    { contents: "Name", sort: { action: "Sort", sortFnGen: sort.workNameSortFnGen } },
                    { contents: "Progress", sort: { action: "Sort", sortFnGen: sort.workProgressSortFnGen } },
                    { contents: "Updated", sort: { action: "Sort", sortFnGen: sort.workUpdatedSortFnGen } },
                    { contents: "Added", sort: { action: "Sort", sortFnGen: sort.workAddedSortFnGen } }
                ] }}
                computeItemKey={(_, work) => work.id}
                itemContent={(index, work) => (
                    <TableRow>
                        <TableCell className="w-[1%] p-[5px]">{index + 1}.</TableCell>
                        <TableCell
                            className={clsx(
                                "max-w-0 p-[5px] overflow-hidden overflow-ellipsis",
                                "hover:bg-neutral-200 active:bg-neutral-300"
                            )}
                            title={work.name}
                            onClick={() => { navigationDispatch({action: "New", page: {id: work.id, type: "Work"}}); }}
                        >{work.name}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px]"
                            title={work.progress}
                        >{work.progress}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px]"
                            title={formatISO9075(work.updated)}
                        >{formatDistanceToNowStrict(work.updated, { addSuffix: true })}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px]"
                            title={formatISO9075(work.added)}
                        >{formatDistanceToNowStrict(work.added, { addSuffix: true })}</TableCell>
                    </TableRow>
                )}
            />
        </div>
    );
}
