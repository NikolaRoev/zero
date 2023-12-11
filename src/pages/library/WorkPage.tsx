import * as api from "../../data/api";
import { useWork, useWorkCreators } from "../../hooks/works";
import { BsPlus } from "react-icons/bs";
import Button from "../../components/Button";
import type { Creator } from "../../data/api";
import CreatorsTable from "../../components/CreatorsTable";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import Select from "../../components/Select";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";
import { confirm } from "@tauri-apps/api/dialog";
import { formatDistanceToNowStrict } from "date-fns";
import { useCreators } from "../../hooks/creators";
import useFormats from "../../hooks/formats";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";
import { useStatuses } from "../../hooks/statuses";
import useTypes from "../../hooks/types";



function AddCreatorsList({ workId, workCreators, onAttachCreator }: { workId: number, workCreators: Creator[], onAttachCreator: (creatorId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { creators } = useCreators();
    const [filter, setFilter] = useSessionState(`ADD-CREATORS-${workId}-KEY`, "");

    const creatorsItems = creators.filter((creator) => creator.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
            <Input
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); } }
            />
            <Virtuoso
                className="border border-neutral-700 rounded"
                data={creatorsItems}
                computeItemKey={(_, creator) => creator.id}
                itemContent={(index, creator) => {
                    const attached = workCreators.find((workCreator) => workCreator.id === creator.id) !== undefined;
                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[5px] flex grow overflow-hidden hover:bg-neutral-200 active:bg-neutral-300",
                                    { "text-neutral-500": attached }
                                )}
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: creator.id } }); }}
                            ><span className="overflow-hidden whitespace-nowrap overflow-ellipsis">{creator.name}</span></div>
                            { !attached && <button
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400"
                                type="button"
                                onClick={() => { onAttachCreator(creator.id); }}
                            ><BsPlus /></button> }
                        </div>
                    );
                }}
            />
        </div>
    );
}


export default function WorkPage({ id }: { id: number }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { work, setWork, getWork } = useWork(id);
    const { workCreators, setWorkCreators, getWorkCreators } = useWorkCreators(id);
    const { statuses } = useStatuses();
    const { types } = useTypes();
    const { formats } = useFormats();

    
    function handleNameChange(id: number, value: string) {
        setWork({...work, name: value });
        api.updateWorkName(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }

    function handleProgressChange(id: number, value: string) {
        setWork({...work, progress: value });
        api.updateWorkProgress(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }

    function handleStatusChange(id: number, value: string) {
        setWork({...work, status: value });
        api.updateWorkStatus(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }

    function handleTypeChange(id: number, value: string) {
        setWork({...work, type: value });
        api.updateWorkType(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }

    function handleFormatChange(id: number, value: string) {
        setWork({...work, format: value });
        api.updateWorkFormat(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }

    function handleAttachCreator(creatorId: number) {
        api.attach(id, creatorId)
            .catch((reason) => { alert(reason); })
            .finally(() => { getWorkCreators(); });
    }

    function handleDetachCreator(creatorId: number) {
        api.detach(id, creatorId)
            .then(() => {
                setWorkCreators(workCreators.filter((creator) => creator.id !== creatorId));
            })
            .catch((reason) => {
                getWorkCreators();
                alert(reason);
            });
    }


    return (
        <div className="grow p-[5px] flex flex-col gap-y-[10px]">
            <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                <label className="whitespace-nowrap">Work ID:</label>
                <label className="col-span-7">{work.id}</label>
                <Button
                    onClick={() => {
                        confirm(`Delete work "${work.name}"?`, { title: "Delete Work", okLabel: "Yes", cancelLabel: "No", type: "warning" }).then(async (result) => {
                            if (result) {
                                await api.removeWork(work.id);
                                navigationDispatch({ action: "Clear" });
                            }
                        }).catch((reason) => { alert(reason); });
                    }}
                >Delete</Button>
                <label>Name:</label>
                <Input
                    className="col-span-8"
                    value={work.name}
                    placeholder="Name"
                    onChange={(event) => { handleNameChange(work.id, event.target.value); } } />
                <label>Progress:</label>
                <Input
                    className="col-span-8"
                    value={work.progress}
                    placeholder="Progress"
                    onChange={(event) => { handleProgressChange(work.id, event.target.value); } } />
                <label>Status:</label>
                <Select
                    className="col-span-2"
                    value={work.status}
                    items={statuses.map((status) => ({ label: status.status, value: status.status }))}
                    onChange={(value) => { handleStatusChange(work.id, value); } }
                    selectMsg="Change Status" />
                <label>Type:</label>
                <Select
                    className="col-span-2"
                    value={work.type}
                    items={types.map((type) => ({ label: type.type, value: type.type }))}
                    onChange={(value) => { handleTypeChange(work.id, value); } }
                    selectMsg="Change Type" />
                <label>Format:</label>
                <Select
                    className="col-span-2"
                    value={work.format}
                    items={formats.map((format) => ({ label: format.format, value: format.format }))}
                    onChange={(value) => { handleFormatChange(work.id, value); } }
                    selectMsg="Change Format" />
                <label>Updated:</label>
                <label className="col-span-8">{work.updated} ({formatDistanceToNowStrict(Date.parse(work.updated), { addSuffix: true })})</label>
                <label>Added:</label>
                <label className="col-span-8">{work.added} ({formatDistanceToNowStrict(Date.parse(work.added), { addSuffix: true })})</label>
            </div>
            <div className="grow grid grid-cols-2 gap-x-[10px]">
                <div className="flex flex-col border border-neutral-700 rounded">
                    <label className="p-[5px] border-b border-neutral-700 ">Creators:</label>
                    <CreatorsTable
                        creators={workCreators}
                        storageKey={`WORK-CREATORS-${id}-SORT-KEY`}
                        name
                        works
                        onDetachCreator={handleDetachCreator} />
                </div>
                <AddCreatorsList workId={id} workCreators={workCreators} onAttachCreator={handleAttachCreator} />
            </div>
        </div>
    );
}
