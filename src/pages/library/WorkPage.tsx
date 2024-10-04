import * as api from "../../data/api";
import * as data from "../../data/data";
import { Option, Select } from "../../components/Select";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075 } from "date-fns";
import AddList from "../../components/AddList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import clsx from "clsx";
import { confirm } from "@tauri-apps/plugin-dialog";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";



export default function WorkPage({ id }: { id: number }) {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const work = dataContext.works.get(id);

    const workCreators: data.Creator[] = [];
    if (work) {
        for (const creatorId of work.creators) {
            const creator = dataContext.creators.get(creatorId);
            if (creator) {
                workCreators.push(creator);
            }
        }
    }

    return (
        work && <div className="grow p-[5px] flex flex-col gap-y-[10px]">
            <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                <span className="whitespace-nowrap">Work ID:</span>
                <span className="col-span-7">{work.id}</span>
                <Button onClick={() => {
                    confirm(
                        `Delete work "${work.name}"?`,
                        { title: "Delete Work", okLabel: "Yes", cancelLabel: "No", kind: "warning" }
                    ).then((result) => {
                        if (result) {
                            dataContext.removeWork(id, () => {
                                toast(`Deleted work "${work.name}".`);
                                navigationDispatch({ action: "Remove", page: { type: "Work", id: id } });
                            });
                        }
                    }).catch((reason: unknown) => { api.error(`${reason}`); });
                }}>Delete</Button>
                <label htmlFor="name-input">Name:</label>
                <Input
                    id="name-input"
                    className="col-span-8"
                    value={work.name}
                    placeholder="Name"
                    title={work.name}
                    onChange={(event) => { dataContext.updateWorkName(work.id, event.target.value); }}
                />
                <label htmlFor="progress-input">Progress:</label>
                <Input
                    id="progress-input"
                    className="col-span-8"
                    value={work.progress}
                    placeholder="Progress"
                    title={work.progress}
                    onChange={(event) => { dataContext.updateWorkProgress(work.id, event.target.value); }}
                />
                <label htmlFor="status-select">Status:</label>
                <Select
                    id="status-select"
                    className="col-span-2"
                    value={work.status.toString()}
                    onChange={(value) => { dataContext.updateWorkStatus(work.id, parseInt(value)); }}
                    selectMsg="Change Status"
                >
                    {dataContext.statuses.map((status) => (
                        <Option key={status.id} value={status.id.toString()}>{status.name}</Option>
                    ))}
                </Select>
                <label htmlFor="type-select">Type:</label>
                <Select
                    id="type-select"
                    className="col-span-2"
                    value={work.type.toString()}
                    onChange={(value) => { dataContext.updateWorkType(work.id, parseInt(value)); }}
                    selectMsg="Change Type"
                >
                    {dataContext.types.map((type) => (
                        <Option key={type.id} value={type.id.toString()}>{type.name}</Option>
                    ))}
                </Select>
                <label htmlFor="format-select">Format:</label>
                <Select
                    id="format-select"
                    className="col-span-2"
                    value={work.format.toString()}
                    onChange={(value) => { dataContext.updateWorkFormat(work.id, parseInt(value)); }}
                    selectMsg="Change Format"
                >
                    {dataContext.formats.map((format) => (
                        <Option key={format.id} value={format.id.toString()}>{format.name}</Option>
                    ))}
                </Select>

                <span >Updated:</span>
                <span className="col-span-8">
                    {formatISO9075(work.updated)} ({formatDistanceToNowStrict(work.updated, { addSuffix: true })})
                </span>

                <span>Added:</span>
                <span className="col-span-8">
                    {formatISO9075(work.added)} ({formatDistanceToNowStrict(work.added, { addSuffix: true })})
                </span>
            </div>
            <div className="grow grid grid-cols-2 gap-x-[10px]">
                <div className="flex flex-col border border-neutral-700 rounded">
                    <span className="p-[5px] border-b border-neutral-700 ">Creators:</span>
                    <Table
                        sortStorageKey={`WORK-CREATORS-${id}-SORT-KEY`}
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
                                <TableCell className="w-[1%] p-[5px]">{index + 1}.</TableCell>
                                <TableCell
                                    className={clsx(
                                        "max-w-0 p-[5px] overflow-hidden overflow-ellipsis",
                                        "hover:bg-neutral-200 active:bg-neutral-300"
                                    )}
                                    title={creator.name}
                                    onClick={() => {
                                        navigationDispatch({action: "New", page: {id: creator.id, type: "Creator"}});
                                    }}
                                >{creator.name}</TableCell>
                                <TableCell
                                    className="w-[1%] p-[5px]"
                                >{creator.works.length}</TableCell>
                                <TableCell className="w-[1%] p-0">
                                    <DeleteButton
                                        title={`Detach creator "${creator.name}".`}
                                        onClick={() => { dataContext.detach(id, creator.id); }}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    />
                </div>
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddList
                        inputName="work-add-creators-list-search-input"
                        storageKey={`ADD-CREATORS-${id}-KEY`}
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
                            onButtonClick: () => { dataContext.attach(id, creator.id); }
                        })}
                    />
                </div>
            </div>
        </div>
    );
}
