import * as data from "../../data/data";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075 } from "date-fns";
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



type AddCreatorFormData = {
    name: string,
    works: number[]
}

const emptyAddCreatorFormData: AddCreatorFormData = {
    name: "",
    works: []
};

type AddCreatorFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "AddWork", id: number } |
    { action: "RemoveWork", id: number }

function addCreatorFormReducer(addCreatorFormData: AddCreatorFormData, action: AddCreatorFormAction): AddCreatorFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddCreatorFormData;
        }
        case "ChangeName": {
            return { ...addCreatorFormData, name: action.name };
        }
        case "AddWork": {
            if (!addCreatorFormData.works.find((id) => id === action.id)) {
                return { ...addCreatorFormData, works: [...addCreatorFormData.works, action.id] };
            }
            else {
                return addCreatorFormData;
            }
        }
        case "RemoveWork": {
            return { ...addCreatorFormData, works: addCreatorFormData.works.filter((id) => id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function AddCreatorTab() {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [addCreatorFormData, addCreatorFormDispatch] = useSessionReducer(
        StorageKey.AddCreatorFormData,
        addCreatorFormReducer,
        emptyAddCreatorFormData
    );
    const addButtonRef = useRef<HTMLButtonElement>(null);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (addButtonRef.current) { addButtonRef.current.disabled = true; }

        const creator: data.Creator = {
            id: 0,
            name: addCreatorFormData.name,
            works: addCreatorFormData.works
        };

        dataContext.addCreator(creator, (id) => {
            toast(<div
                onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: id}}); }}
            >{`Added creator "${addCreatorFormData.name}".`}</div>);
            addCreatorFormDispatch({ action: "Clear" });
        }, () => { if (addButtonRef.current) { addButtonRef.current.disabled = false; } });
    }


    const creatorWorks: data.Work[] = [];
    for (const workId of addCreatorFormData.works) {
        const work = dataContext.works.get(workId);
        if (work) {
            creatorWorks.push(work);
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
                        value={addCreatorFormData.name}
                        onChange={(event) => { addCreatorFormDispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <span className="p-[5px] border-b border-neutral-700 ">Works:</span>
                        <Table
                            sortStorageKey={StorageKey.AddCreatorWorksSort}
                            data={creatorWorks}
                            header={{ className: clsx("text-sm"), rows: [
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
                                { contents: "Status", sort: {
                                    action: "Sort",
                                    sortFnGen: (ascending: boolean) => ascending ?
                                        (a: data.Work, b: data.Work) => {
                                            const statusA = dataContext.getStatus(a.status);
                                            const statusB = dataContext.getStatus(b.status);
                                            return statusA.name.localeCompare(statusB.name);
                                        } :
                                        (a: data.Work, b: data.Work) => {
                                            const statusA = dataContext.getStatus(a.status);
                                            const statusB = dataContext.getStatus(b.status);
                                            return statusB.name.localeCompare(statusA.name);
                                        }
                                } },
                                { contents: "Type", sort: {
                                    action: "Sort",
                                    sortFnGen: (ascending: boolean) => ascending ?
                                        (a: data.Work, b: data.Work) => {
                                            const typeA = dataContext.getType(a.type);
                                            const typeB = dataContext.getType(b.type);
                                            return typeA.name.localeCompare(typeB.name);
                                        } :
                                        (a: data.Work, b: data.Work) => {
                                            const typeA = dataContext.getType(a.type);
                                            const typeB = dataContext.getType(b.type);
                                            return typeB.name.localeCompare(typeA.name);
                                        }
                                } },
                                { contents: "Format", sort: {
                                    action: "Sort",
                                    sortFnGen: (ascending: boolean) => ascending ?
                                        (a: data.Work, b: data.Work) => {
                                            const formatA = dataContext.getFormat(a.format);
                                            const formatB = dataContext.getFormat(b.format);
                                            return formatA.name.localeCompare(formatB.name);
                                        } :
                                        (a: data.Work, b: data.Work) => {
                                            const formatA = dataContext.getFormat(a.format);
                                            const formatB = dataContext.getFormat(b.format);
                                            return formatB.name.localeCompare(formatA.name);
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
                                } },
                                { contents: "" }
                            ] }}
                            computeItemKey={(_, work) => work.id}
                            itemContent={(index, work) => (
                                <TableRow>
                                    <TableCell className="w-[1%] p-[5px] text-xs">{index + 1}.</TableCell>
                                    <TableCell
                                        className={clsx(
                                            "max-w-0 p-[5px] text-xs overflow-hidden overflow-ellipsis",
                                            "hover:bg-neutral-200 active:bg-neutral-300"
                                        )}
                                        title={work.name}
                                        onClick={() => { navigationDispatch({action: "New", page: {id: work.id, type: "Work"}}); }}
                                    >{work.name}</TableCell>
                                    <TableCell
                                        className="w-[1%] p-[5px] text-xs"
                                        title={work.progress}
                                    >{work.progress}</TableCell>
                                    <TableCell className="w-[1%] p-[5px] text-xs">
                                        {dataContext.statuses.find((status) => status.id === work.status)?.name}
                                    </TableCell>
                                    <TableCell className="w-[1%] p-[5px] text-xs">
                                        {dataContext.types.find((type) => type.id === work.type)?.name}
                                    </TableCell>
                                    <TableCell className="w-[1%] p-[5px] text-xs">
                                        {dataContext.formats.find((format) => format.id === work.format)?.name}
                                    </TableCell>
                                    <TableCell
                                        className="w-[1%] p-[5px] text-xs"
                                        title={formatISO9075(work.updated)}
                                    >{formatDistanceToNowStrict(work.updated, { addSuffix: true })}</TableCell>
                                    <TableCell
                                        className="w-[1%] p-[5px] text-xs"
                                        title={formatISO9075(work.added)}
                                    >{formatDistanceToNowStrict(work.added, { addSuffix: true })}</TableCell>
                                    <TableCell className="w-[1%] p-0">
                                        <DeleteButton
                                            title={`Remove work "${work.name}".`}
                                            onClick={() => {
                                                addCreatorFormDispatch({ action: "RemoveWork", id: work.id });
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddList
                            inputName="add-creator-add-works-list-search-input"
                            storageKey={StorageKey.AddCreatorWorksFilter}
                            data={Array.from(dataContext.works.values())}
                            filterFn={(works, comparator) => works.filter((work) => comparator(work.name))}
                            findFn={(work) => (
                                creatorWorks.find((creatorWork) => creatorWork.id === work.id) !== undefined
                            )}
                            computeItemKey={(_, work) => work.id}
                            itemContent={(work) => ({
                                contents: work.name,
                                onItemClick: () => {
                                    navigationDispatch({ action: "New", page: { type: "Work", id: work.id } });
                                },
                                onButtonClick: () => {
                                    addCreatorFormDispatch({ action: "AddWork", id: work.id });
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
                        onClick={() => { addCreatorFormDispatch({ action: "Clear" }); }}
                    >Clear</Button>
                </div>
            </form>
        </div>
    );
}
