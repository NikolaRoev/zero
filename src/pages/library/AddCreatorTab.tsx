import * as sort from "../../utility/sortingFunctions";
import type { Creator, Work } from "../../data/api";
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
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer";



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
    const [addCreatorFormData, addCreatorFormDispatch] = useSessionReducer(StorageKey.AddCreatorFormData, addCreatorFormReducer, emptyAddCreatorFormData);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const creator: Creator = {
            id: 0,
            name: addCreatorFormData.name,
            works: addCreatorFormData.works
        };

        dataContext.addCreator(creator, (id) => {
            toast(<div
                onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: id}}); }}
            >{`Added creator "${addCreatorFormData.name}".`}</div>);
            addCreatorFormDispatch({ action: "Clear" });
        });
    }


    const creatorWorks: Work[] = [];
    for (const workId of addCreatorFormData.works) {
        const work = dataContext.works.get(workId);
        if (work) {
            creatorWorks.push(work);
        }
    }

    return (
        <div className="p-[5px] grow flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col grow gap-y-[10px]">
                <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                    <div className="col-span-9 flex rounded">
                        <Button
                            className="ml-auto"
                            type="button"
                            onClick={() => { addCreatorFormDispatch({ action: "Clear" }); }}
                        >Clear</Button>
                    </div>
                    <label>Name:</label>
                    <Input
                        className="col-span-8"
                        value={addCreatorFormData.name}
                        onChange={(event) => { addCreatorFormDispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <label className="p-[5px] border-b border-neutral-700 ">Works:</label>
                        <Table
                            sortStorageKey={StorageKey.AddCreatorWorksSort}
                            data={creatorWorks}
                            header={{ className: clsx("text-sm"), rows: [
                                { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                                { contents: "Name", sort: { action: "Sort", sortFnGen: sort.workNameSortFnGen } },
                                { contents: "Progress", sort: { action: "Sort", sortFnGen: sort.workProgressSortFnGen } },
                                { contents: "Status", sort: { action: "Sort", sortFnGen: sort.workStatusSortFnGen } },
                                { contents: "Type", sort: { action: "Sort", sortFnGen: sort.workTypeSortFnGen } },
                                { contents: "Format", sort: { action: "Sort", sortFnGen: sort.workFormatSortFnGen } },
                                { contents: "Updated", sort: { action: "Sort", sortFnGen: sort.workUpdatedSortFnGen } },
                                { contents: "Added", sort: { action: "Sort", sortFnGen: sort.workAddedSortFnGen } },
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
                                    <TableCell className="w-[1%] p-[5px] text-xs">{work.status}</TableCell>
                                    <TableCell className="w-[1%] p-[5px] text-xs">{work.type}</TableCell>
                                    <TableCell className="w-[1%] p-[5px] text-xs">{work.format}</TableCell>
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
                                            onClick={() => { addCreatorFormDispatch({ action: "RemoveWork", id: work.id }); }}
                                            title={`Remove work "${work.name}".`}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddList
                            storageKey={StorageKey.AddCreatorWorksFilter}
                            data={Array.from(dataContext.works.values())}
                            filterFn={(works, filter) => works.filter((work) => work.name.toLowerCase().includes(filter.toLowerCase()))}
                            findFn={(work) => creatorWorks.find((creatorWork) => creatorWork.id === work.id) !== undefined }
                            computeItemKey={(_, work) => work.id}
                            itemContent={(work) => ({
                                contents: work.name,
                                onItemClick: () => { navigationDispatch({ action: "New", page: { type: "Work", id: work.id } }); },
                                onButtonClick: () => { addCreatorFormDispatch({ action: "AddWork", id: work.id }); }
                            })}
                        />
                    </div>
                </div>
                <div className="pb-[5px] col-span-9">
                    <Button className="w-[100px]">Add</Button>
                </div>
            </form>
        </div>
    );
}
