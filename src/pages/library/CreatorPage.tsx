import * as api from "../../data/api";
import * as data from "../../data/data";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075 } from "date-fns";
import AddList from "../../components/AddList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import clsx from "clsx";
import { confirm } from "@tauri-apps/api/dialog";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";



export default function CreatorPage({ id }: { id: number }) {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const creator = dataContext.creators.get(id);

    const creatorWorks: data.Work[] = [];
    if (creator) {
        for (const workId of creator.works) {
            const work = dataContext.works.get(workId);
            if (work) {
                creatorWorks.push(work);
            }
        }
    }

    return (
        creator && <div className="grow p-[5px] flex flex-col gap-y-[10px]">
            <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                <span className="whitespace-nowrap">Creator ID:</span>
                <span className="col-span-7">{creator.id}</span>
                <Button onClick={() => {
                    confirm(
                        `Delete creator "${creator.name}"?`,
                        { title: "Delete Creator", okLabel: "Yes", cancelLabel: "No", type: "warning" }
                    ).then((result) => {
                        if (result) {
                            dataContext.removeCreator(creator.id, () => {
                                toast(`Deleted creator "${creator.name}".`);
                                navigationDispatch({ action: "Remove", page: { type: "Creator", id: id } });
                            });
                        }
                    }).catch((reason: string) => { api.error(reason); });
                }}>Delete</Button>
                <label htmlFor="name-input">Name:</label>
                <Input
                    id="name-input"
                    className="col-span-8"
                    value={creator.name}
                    placeholder="Name"
                    onChange={(event) => { dataContext.updateCreatorName(creator.id, event.target.value); }}
                />
                <span>Works:</span>
                <span className="col-span-7">{creator.works.length}</span>
            </div>

            <div className="grow grid grid-cols-2 gap-x-[10px]">
                <div className="flex flex-col border border-neutral-700 rounded">
                    <span className="p-[5px] border-b border-neutral-700 ">Works:</span>
                    <Table
                        sortStorageKey={`CREATOR-WORKS-${id}-SORT-KEY`}
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
                                    onClick={() => {
                                        navigationDispatch({action: "New", page: {id: work.id, type: "Work"}});
                                    }}
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
                                        title={`Detach work "${work.name}".`}
                                        onClick={() => { dataContext.detach(work.id, id); }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    />
                </div>
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddList
                        inputName="creator-add-works-list-search-input"
                        storageKey={`ADD-WORKS-${id}-KEY`}
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
                            onButtonClick: () => { dataContext.attach(work.id, id); }
                        })}
                    />
                </div>
            </div>
        </div>
    );
}
