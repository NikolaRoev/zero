import * as data from "../../data/data";
import { Option, Select } from "../../components/Select";
import { Table, TableCell, TableRow } from "../../components/Table";
import AddList from "../../components/AddList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useRef } from "react";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer-hook";



type AddWorkFormData = {
    name: string,
    progress: string,
    statusIndex: number,
    typeIndex: number,
    formatIndex: number,
    creators: number[]
}

const emptyAddWorkFormData: AddWorkFormData = {
    name: "",
    progress: "",
    statusIndex: 0,
    typeIndex: 0,
    formatIndex: 0,
    creators: []
};

type AddWorkFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "ChangeProgress", progress: string } |
    { action: "ChangeStatus", statusIndex: number } |
    { action: "ChangeType", typeIndex: number } |
    { action: "ChangeFormat", formatIndex: number } |
    { action: "AddCreator", id: number } |
    { action: "RemoveCreator", id: number }

function addWorkFormReducer(addWorkFormData: AddWorkFormData, action: AddWorkFormAction): AddWorkFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddWorkFormData;
        }
        case "ChangeName": {
            return { ...addWorkFormData, name: action.name };
        }
        case "ChangeProgress": {
            return { ...addWorkFormData, progress: action.progress };
        }
        case "ChangeStatus": {
            return { ...addWorkFormData, statusIndex: action.statusIndex };
        }
        case "ChangeType": {
            return { ...addWorkFormData, typeIndex: action.typeIndex };
        }
        case "ChangeFormat": {
            return { ...addWorkFormData, formatIndex: action.formatIndex };
        }
        case "AddCreator": {
            if (!addWorkFormData.creators.find((id) => id === action.id)) {
                return { ...addWorkFormData, creators: [...addWorkFormData.creators, action.id] };
            }
            return addWorkFormData;
        }
        case "RemoveCreator": {
            return { ...addWorkFormData, creators: addWorkFormData.creators.filter((id) => id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}


export default function AddWorkTab() {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [addWorkFormData, addWorkFormDispatch] = useSessionReducer(
        StorageKey.AddWorkFormData,
        addWorkFormReducer,
        emptyAddWorkFormData
    );
    const addButtonRef = useRef<HTMLButtonElement>(null);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        const status = dataContext.statuses[addWorkFormData.statusIndex];
        const type = dataContext.types[addWorkFormData.typeIndex];
        const format = dataContext.formats[addWorkFormData.formatIndex];

        if (status && type && format) {
            if (addButtonRef.current) { addButtonRef.current.disabled = true; }

            const timestamp = Date.now();
            const work: data.Work = {
                id: 0,
                name: addWorkFormData.name,
                progress: addWorkFormData.progress,
                status: status.id,
                type: type.id,
                format: format.id,
                updated: timestamp,
                added: timestamp,
                creators: addWorkFormData.creators
            };

            dataContext.addWork(work, (id) => {
                toast(<div
                    onClick={() => { navigationDispatch({ action: "New", page: { type: "Work", id: id}}); }}
                >{`Added work "${addWorkFormData.name}".`}</div>);
                addWorkFormDispatch({ action: "Clear" });
            }, () => { if (addButtonRef.current) { addButtonRef.current.disabled = false; } });
        }
    }


    const workCreators: data.Creator[] = [];
    for (const creatorId of addWorkFormData.creators) {
        const creator = dataContext.creators.get(creatorId);
        if (creator) {
            workCreators.push(creator);
        }
    }

    return (
        <div className="px-[5px] py-[10px] grow flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col grow gap-y-[10px]">
                <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                    <label htmlFor="name-input">Name:</label>
                    <Input
                        id="name-input"
                        className="col-span-8"
                        value={addWorkFormData.name}
                        onChange={(event) => { addWorkFormDispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                    <label htmlFor="progress-input">Progress:</label>
                    <Input
                        id="progress-input"
                        className="col-span-8"
                        value={addWorkFormData.progress}
                        onChange={(event) => { addWorkFormDispatch({ action: "ChangeProgress", progress: event.target.value }); }}
                        placeholder="Progress"
                        required={true}
                    />
                    <label htmlFor="status-select">Status:</label>
                    <Select
                        id="status-select"
                        className="col-span-2"
                        value={addWorkFormData.statusIndex.toString()}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeStatus", statusIndex: parseInt(value) }); }}
                        selectMsg="Select Status"
                        errorMsg="No Statuses"
                    >
                        {dataContext.statuses.map((status, index) => (
                            <Option key={status.id} value={index.toString()}>{status.name}</Option>
                        ))}
                    </Select>
                    <label htmlFor="type-select">Type:</label>
                    <Select
                        id="type-select"
                        className="col-span-2"
                        value={addWorkFormData.typeIndex.toString()}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeType", typeIndex: parseInt(value) }); }}
                        selectMsg="Select Type"
                        errorMsg="No Types"
                    >
                        {dataContext.types.map((type, index) => (
                            <Option key={type.id} value={index.toString()}>{type.name}</Option>
                        ))}
                    </Select>
                    <label htmlFor="format-select">Format:</label>
                    <Select
                        id="format-select"
                        className="col-span-2"
                        value={addWorkFormData.formatIndex.toString()}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeFormat", formatIndex: parseInt(value) }); }}
                        selectMsg="Select Format"
                        errorMsg="No Formats"
                    >
                        {dataContext.formats.map((format, index) => (
                            <Option key={format.id} value={index.toString()}>{format.name}</Option>
                        ))}
                    </Select>
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <span className="p-[5px] border-b border-neutral-700 ">Creators:</span>
                        <Table
                            sortStorageKey={StorageKey.AddWorkCreatorsSort}
                            data={workCreators}
                            header={{ rows: [
                                { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                                { contents: "Name", sort: {
                                    action: "Sort",
                                    sortFnGen: (ascending: boolean) => ascending ?
                                        (a: data.Creator, b: data.Creator) => a.name.localeCompare(b.name) :
                                        (a: data.Creator, b: data.Creator) => b.name.localeCompare(a.name)
                                } },
                                { contents: "Works", sort: {
                                    action: "Sort",
                                    sortFnGen: (ascending: boolean) => ascending ?
                                        (a: data.Creator, b: data.Creator) => a.works.length - b.works.length :
                                        (a: data.Creator, b: data.Creator) => b.works.length - a.works.length
                                } },
                                { contents: "" }
                            ] }}
                            computeItemKey={(_, creator) => creator.id}
                            itemContent={(index, creator) => (
                                <TableRow>
                                    <TableCell className="w-[1%] p-[5px] text-sm">{index + 1}.</TableCell>
                                    <TableCell
                                        className={clsx(
                                            "max-w-0 p-[5px] text-sm overflow-hidden overflow-ellipsis",
                                            "hover:bg-neutral-200 active:bg-neutral-300"
                                        )}
                                        title={creator.name}
                                        onClick={() => {
                                            navigationDispatch({action: "New", page: {id: creator.id, type: "Creator"}});
                                        }}
                                    >{creator.name}</TableCell>
                                    <TableCell
                                        className="w-[1%] p-[5px] text-sm"
                                    >{creator.works.length}</TableCell>
                                    <TableCell className="w-[1%] p-0">
                                        <DeleteButton
                                            title={`Detach creator "${creator.name}".`}
                                            onClick={() => {
                                                addWorkFormDispatch({ action: "RemoveCreator", id: creator.id });
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddList
                            inputName="add-work-add-creators-list-search-input"
                            storageKey={StorageKey.AddWorkCreatorsFilter}
                            data={Array.from(dataContext.creators.values())}
                            filterFn={(creators, comparator) => creators.filter((creator) => comparator(creator.name))}
                            findFn={(creator) => (
                                workCreators.find((workCreator) => workCreator.id === creator.id) !== undefined
                            )}
                            computeItemKey={(_, creator) => creator.id}
                            itemContent={(creator) => ({
                                contents: creator.name,
                                onItemClick: () => {
                                    navigationDispatch({ action: "New", page: { type: "Creator", id: creator.id } });
                                },
                                onButtonClick: () => {
                                    addWorkFormDispatch({ action: "AddCreator", id: creator.id });
                                }
                            })}
                        />
                    </div>
                </div>
                <div className="col-span-9 flex justify-between">
                    <Button ref={addButtonRef} className="w-[100px]">Add</Button>
                    <Button
                        className="w-[100px]"
                        type="button"
                        onClick={() => { addWorkFormDispatch({ action: "Clear" }); }}
                    >Clear</Button>
                </div>
            </form>
        </div>
    );
}
