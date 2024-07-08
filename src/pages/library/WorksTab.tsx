import * as data from "../../data/data";
import { type ComparatorType, SearchInput } from "../../components/SearchInput";
import { Option, Select } from "../../components/Select";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075, isSameDay, isWithinInterval } from "date-fns";
import { fromAbsolute, getLocalTimeZone } from "@internationalized/date";
import Button from "../../components/Button";
import CheckboxGroup from "../../components/CheckboxGroup";
import { DataContext } from "../../contexts/data-context";
import type { DateRange } from "react-aria";
import { DateRangePicker } from "../../components/DateRangePicker";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer-hook";
import { useState } from "react";



type By = "name" | "progress";
type Filter = {
    value: string,
    comparatorType: ComparatorType,
    editDistance: number,
    by: By,
    statuses: number[],
    types: number[],
    formats: number[],
    updatedRange: { start: number, end: number } | null,
    addedRange: { start: number, end: number } | null
}

const emptyFilter: Filter = {
    value: "",
    comparatorType: "None",
    editDistance: 5,
    by: "name",
    statuses: [],
    types: [],
    formats: [],
    updatedRange: null,
    addedRange: null
};

type FilterAction =
    { action: "Clear" } |
    { action: "ChangeValue", value: string } |
    { action: "ChangeComparatorType", comparatorType: ComparatorType } |
    { action: "ChangeEditDistance", editDistance: number } |
    { action: "ChangeBy", by: By } |
    { action: "AddStatus", status: number } |
    { action: "RemoveStatus", status: number } |
    { action: "AddType", type: number } |
    { action: "RemoveType", type: number } |
    { action: "AddFormat", format: number } |
    { action: "RemoveFormat", format: number } |
    { action: "ChangeUpdatedRange", range: DateRange | null } |
    { action: "ChangeAddedRange", range: DateRange | null }

function filterReducer(filter: Filter, action: FilterAction): Filter {
    switch (action.action) {
        case "Clear":
            return emptyFilter;
        case "ChangeValue":
            return { ...filter, value: action.value };
        case "ChangeComparatorType":
            return { ...filter, comparatorType: action.comparatorType };
        case "ChangeEditDistance":
            return { ...filter, editDistance: action.editDistance };
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
        case "ChangeUpdatedRange": {
            return { ...filter, updatedRange: action.range && {
                start: action.range.start.toDate(getLocalTimeZone()).getTime(),
                end: action.range.end.toDate(getLocalTimeZone()).getTime()
            } };
        }
        case "ChangeAddedRange": {
            return { ...filter, addedRange: action.range && {
                start: action.range.start.toDate(getLocalTimeZone()).getTime(),
                end: action.range.end.toDate(getLocalTimeZone()).getTime()
            } };
        }
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
    const [comparator, setComparator] = useState<(value: string) => boolean>(() => () => false);


    const worksItems = Array.from(works.values()).filter((work) => {
        switch (filter.by) {
            case "name": {
                if (!comparator(work.name)) {
                    return false;
                }
                break;
            }
            case "progress": {
                if (!comparator(work.progress)) {
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

        if (filter.updatedRange) {
            if ((!isSameDay(work.updated, filter.updatedRange.start) &&
                !isSameDay(work.updated, filter.updatedRange.end)) &&
                !isWithinInterval(work.updated, filter.updatedRange)) {
                return false;
            }
        }

        if (filter.addedRange) {
            if ((!isSameDay(work.added, filter.addedRange.start) &&
                 !isSameDay(work.added, filter.addedRange.end)) &&
                 !isWithinInterval(work.added, filter.addedRange)) {
                return false;
            }
        }
        

        return true;
    });
    
    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col gap-y-[5px]">
                <div className="flex gap-x-[3px]">
                    <SearchInput
                        setComparator={setComparator}
                        filter={filter.value}
                        comparatorType={filter.comparatorType}
                        setComparatorType={(newComparatorType) => {
                            filterDispatch({ action: "ChangeComparatorType", comparatorType: newComparatorType });
                        }}
                        editDistance={filter.editDistance}
                        setEditDistance={(editDistance) => {
                            filterDispatch({ action: "ChangeEditDistance", editDistance: editDistance });
                        }}
                        name={"works-search-input"}
                        onChange={(event) => { filterDispatch({ action: "ChangeValue", value: event.target.value }); }}
                        className="grow"
                        autoFocus
                    />
                    <Select
                        name="works-search-select"
                        value={filter.by}
                        onChange={(value: By) => { filterDispatch({ action: "ChangeBy", by: value }); }}
                        selectMsg="Find By"
                    >
                        <Option value={"name"}>Name</Option>
                        <Option value={"progress"}>Progress</Option>
                    </Select>
                    <Button onClick={() => { filterDispatch({ action: "Clear"}); }}>Clear</Button>
                </div>
                <div className="flex flex-wrap">
                    <div className="grid grid-cols-3 gap-x-[5px]">
                        <CheckboxGroup
                            className="w-[25vw]"
                            legend="Statuses"
                            items={statuses}
                            checkboxContent={(status) => ({
                                key: status.id,
                                checked: filter.statuses.includes(status.id),
                                onChange: (event) => {
                                    if (event.target.checked) { filterDispatch({ action: "AddStatus", status: status.id}); }
                                    else { filterDispatch({ action: "RemoveStatus", status: status.id}); }
                                },
                                labelContents: status.name,
                                labelClassName: clsx({ "underline": status.isUpdate }),
                                labelTitle: status.isUpdate ? "Update status." : undefined
                            })}
                        />
                        <CheckboxGroup
                            className="w-[25vw]"
                            legend="Types"
                            items={types}
                            checkboxContent={(type) => ({
                                key: type.id,
                                checked: filter.types.includes(type.id),
                                onChange: (event) => {
                                    if (event.target.checked) { filterDispatch({ action: "AddType", type: type.id}); }
                                    else { filterDispatch({ action: "RemoveType", type: type.id}); }
                                },
                                labelContents: type.name
                            })}
                        />
                        <CheckboxGroup
                            className="w-[25vw]"
                            legend="Formats"
                            items={formats}
                            checkboxContent={(format) => ({
                                key: format.id,
                                checked: filter.formats.includes(format.id),
                                onChange: (event) => {
                                    if (event.target.checked) { filterDispatch({ action: "AddFormat", format: format.id}); }
                                    else { filterDispatch({ action: "RemoveFormat", format: format.id}); }
                                },
                                labelContents: format.name
                            })}
                        />
                    </div>
                    <div className="grow p-[5px] flex flex-col gap-y-[5px] items-center justify-center">
                        <DateRangePicker
                            label="Updated"
                            granularity="day"
                            value={filter.updatedRange && {
                                start: fromAbsolute(filter.updatedRange.start, getLocalTimeZone()),
                                end: fromAbsolute(filter.updatedRange.end, getLocalTimeZone())
                            }}
                            onChange={(range: DateRange) => { filterDispatch({ action: "ChangeUpdatedRange", range: range}); }}
                        />
                        <DateRangePicker
                            label="Added"
                            granularity="day"
                            value={filter.addedRange && {
                                start: fromAbsolute(filter.addedRange.start, getLocalTimeZone()),
                                end: fromAbsolute(filter.addedRange.end, getLocalTimeZone())
                            }}
                            onChange={(range: DateRange) => { filterDispatch({ action: "ChangeAddedRange", range: range}); }}
                        />
                    </div>
                </div>
            </div>

            <Table
                sortStorageKey={StorageKey.LibraryWorksSort}
                data={worksItems}
                header={{ rows: [
                    { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                    { contents: "Name", sort: {
                        action: "Sort",
                        sortFnGen: (ascending: boolean) => ascending ?
                            (a: data.Work, b: data.Work) => a.name.localeCompare(b.name) :
                            (a: data.Work, b: data.Work) => b.name.localeCompare(a.name)
                    } },
                    { contents: "Progress", sort: {
                        action: "Sort",
                        sortFnGen: (ascending: boolean) => ascending ?
                            (a: data.Work, b: data.Work) => {
                                const numA = Number(a.progress) || Number.POSITIVE_INFINITY;
                                const numB = Number(b.progress) || Number.POSITIVE_INFINITY;
                                return numA - numB;
                            } :
                            (a: data.Work, b: data.Work) => {
                                const numA = Number(a.progress) || Number.NEGATIVE_INFINITY;
                                const numB = Number(b.progress) || Number.NEGATIVE_INFINITY;
                                return numB - numA;
                            }
                    } },
                    { contents: "Updated", sort: {
                        action: "Sort",
                        sortFnGen: (ascending: boolean) => ascending ?
                            (a: data.Work, b: data.Work) => b.updated - a.updated :
                            (a: data.Work, b: data.Work) => a.updated - b.updated
                    } },
                    { contents: "Added", sort: {
                        action: "Sort",
                        sortFnGen: (ascending: boolean) => ascending ?
                            (a: data.Work, b: data.Work) => b.added - a.added :
                            (a: data.Work, b: data.Work) => a.added - b.added
                    } }
                ] }}
                computeItemKey={(_, work) => work.id}
                itemContent={(index, work) => (
                    <TableRow>
                        <TableCell className="w-[1%] p-[5px] text-sm">{index + 1}.</TableCell>
                        <TableCell
                            className={clsx(
                                "max-w-0 p-[5px] text-sm overflow-hidden overflow-ellipsis",
                                "hover:bg-neutral-200 active:bg-neutral-300"
                            )}
                            title={work.name}
                            onClick={() => {
                                navigationDispatch({action: "New", page: {id: work.id, type: "Work"}});
                            }}
                        >{work.name}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px] text-sm"
                            title={work.progress}
                        >{work.progress}</TableCell>
                        <TableCell
                            className="w-[1%] p-[5px] text-xs"
                            title={formatISO9075(work.updated)}
                        >
                            <div className="flex gap-x-[5px]">
                                <span>{formatISO9075(work.updated, { representation: "date" })}</span>
                                <span>({formatDistanceToNowStrict(work.updated, { addSuffix: true })})</span>
                            </div>
                        </TableCell>
                        <TableCell
                            className="w-[1%] p-[5px] text-xs"
                            title={formatISO9075(work.added)}
                        >
                            <div className="flex gap-x-[5px]">
                                <span>{formatISO9075(work.added, { representation: "date" })}</span>
                                <span>({formatDistanceToNowStrict(work.added, { addSuffix: true })})</span>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            />
        </div>
    );
}
