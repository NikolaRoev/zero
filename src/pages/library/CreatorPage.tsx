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
import { error } from "tauri-plugin-log-api";
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
                    }).catch((reason: string) => { error(reason); });
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
                            { contents: "Name", sort: { action: "Sort", sortFnGen: data.workNameSortFnGen } },
                            { contents: "Progress", sort: { action: "Sort", sortFnGen: data.workProgressSortFnGen } },
                            { contents: "Status", sort: { action: "Sort", sortFnGen: data.workStatusSortFnGen } },
                            { contents: "Type", sort: { action: "Sort", sortFnGen: data.workTypeSortFnGen } },
                            { contents: "Format", sort: { action: "Sort", sortFnGen: data.workFormatSortFnGen } },
                            { contents: "Updated", sort: { action: "Sort", sortFnGen: data.workUpdatedSortFnGen } },
                            { contents: "Added", sort: { action: "Sort", sortFnGen: data.workAddedSortFnGen } },
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
                        filterFn={(works, filter) => works.filter((work) => (
                            work.name.toLowerCase().includes(filter.toLowerCase()))
                        )}
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
