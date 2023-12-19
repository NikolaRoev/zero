import * as api from "../../data/api";
import * as sort from "../../utility/sortingFunctions";
import { Option, Select } from "../../components/Select";
import { Table, TableCell, TableRow } from "../../components/Table";
import { formatDistanceToNowStrict, formatISO9075 } from "date-fns";
import AddCreatorsList from "../../components/AddCreatorsList";
import Button from "../../components/Button";
import type { Creator } from "../../data/api";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import clsx from "clsx";
import { confirm } from "@tauri-apps/api/dialog";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";



export default function WorkPage({ id }: { id: number }) {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const work = dataContext.works.get(id);

    const workCreators: Creator[] = [];
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
                <label className="whitespace-nowrap">Work ID:</label>
                <label className="col-span-7">{work.id}</label>
                <Button onClick={() => {
                    confirm(
                        `Delete work "${work.name}"?`,
                        { title: "Delete Work", okLabel: "Yes", cancelLabel: "No", type: "warning" }
                    ).then((result) => {
                        if (result) {
                            dataContext.removeWork(id, () => {
                                toast(`Deleted work "${work.name}".`);
                                navigationDispatch({ action: "Remove", page: { type: "Work", id: id } });
                            });
                        }
                    }).catch((reason: string) => { api.error(reason); });
                }}>Delete</Button>
                <label>Name:</label>
                <Input
                    className="col-span-8"
                    value={work.name}
                    placeholder="Name"
                    onChange={(event) => { dataContext.updateWorkName(work.id, event.target.value); }}
                />
                <label>Progress:</label>
                <Input
                    className="col-span-8"
                    value={work.progress}
                    placeholder="Progress"
                    onChange={(event) => { dataContext.updateWorkProgress(work.id, event.target.value); }}
                />
                <label>Status:</label>
                <Select
                    className="col-span-2"
                    value={work.status}
                    onChange={(value) => { dataContext.updateWorkStatus(work.id, value); }}
                    selectMsg="Change Status"
                >
                    {dataContext.statuses.map((status) => (
                        <Option
                            key={status.status}
                            value={status.status}
                        >{status.status}</Option>
                    ))}
                </Select>
                <label>Type:</label>
                <Select
                    className="col-span-2"
                    value={work.type}
                    onChange={(value) => { dataContext.updateWorkType(work.id, value); }}
                    selectMsg="Change Type"
                >
                    {dataContext.types.map((type) => (
                        <Option key={type.type} value={type.type}>{type.type}</Option>
                    ))}
                </Select>
                <label>Format:</label>
                <Select
                    className="col-span-2"
                    value={work.format}
                    onChange={(value) => { dataContext.updateWorkFormat(work.id, value); }}
                    selectMsg="Change Format"
                >
                    {dataContext.formats.map((format) => (
                        <Option key={format.format} value={format.format}>{format.format}</Option>
                    ))}
                </Select>

                <label>Updated:</label>
                <label className="col-span-8">
                    {formatISO9075(work.updated)} ({formatDistanceToNowStrict(work.updated, { addSuffix: true })})
                </label>

                <label>Added:</label>
                <label className="col-span-8">
                    {formatISO9075(work.added)} ({formatDistanceToNowStrict(work.added, { addSuffix: true })})
                </label>
            </div>
            <div className="grow grid grid-cols-2 gap-x-[10px]">
                <div className="flex flex-col border border-neutral-700 rounded">
                    <label className="p-[5px] border-b border-neutral-700 ">Creators:</label>
                    <Table
                        sortStorageKey={`WORK-CREATORS-${id}-SORT-KEY`}
                        data={workCreators}
                        header={{ rows: [
                            { contents: "", title: "Clear Sort", sort: { action: "Clear" } },
                            { contents: "Name", sort: { action: "Sort", sortFnGen: sort.creatorNameSortFnGen } },
                            { contents: "Works", sort: { action: "Sort", sortFnGen: sort.creatorWorksSortFnGen } },
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
                                    onClick={() => { navigationDispatch({action: "New", page: {id: creator.id, type: "Creator"}}); }}
                                >{creator.name}</TableCell>
                                <TableCell
                                    className="w-[1%] p-[5px]"
                                >{creator.works.length}</TableCell>
                                <TableCell className="w-[1%] p-0">
                                    <DeleteButton
                                        onClick={() => { dataContext.detach(id, creator.id); }}
                                        title={`Detach creator "${creator.name}".`}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    />
                </div>
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddCreatorsList
                        workCreators={workCreators}
                        storageKey={`ADD-CREATORS-${id}-KEY`}
                        onButtonClick={(creatorId) => { dataContext.attach(id, creatorId); }}
                    />
                </div>
            </div>
        </div>
    );
}
