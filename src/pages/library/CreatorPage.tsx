import * as api from "../../data/api";
import { useCreator, useCreatorWorks } from "../../hooks/creators";
import { BsPlus } from "react-icons/bs";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { Virtuoso} from "react-virtuoso";
import type { Work } from "../../data/api";
import WorksTable from "../../components/WorksTable";
import clsx from "clsx";
import { confirm } from "@tauri-apps/api/dialog";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";
import { useWorks } from "../../hooks/works";



function AddWorksList({ creatorId, creatorWorks, onAttachWork }: { creatorId: number, creatorWorks: Work[], onAttachWork: (workId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { works } = useWorks();
    const [filter, setFilter] = useSessionState(`ADD-WORKS-${creatorId}-KEY`, "");

    const worksItems = works.filter((work) => work.name.toLowerCase().includes(filter.toLowerCase()));
    
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
                data={worksItems}
                computeItemKey={(_, work) => work.id}
                itemContent={(index, work) => {
                    const attached = creatorWorks.find((creatorWork) => creatorWork.id === work.id) !== undefined;
                    return (
                        <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                            <div
                                className={clsx(
                                    "p-[5px] flex grow overflow-hidden hover:bg-neutral-200 active:bg-neutral-300",
                                    { "text-neutral-500": attached }
                                )}
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Work", id: work.id } }); }}
                            ><span className="overflow-hidden whitespace-nowrap overflow-ellipsis">{work.name}</span></div>
                            { !attached && <button
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400"
                                type="button"
                                onClick={() => { onAttachWork(work.id); }}
                            ><BsPlus /></button> }
                        </div>
                    );
                }}
            />
        </div>
    );
}


export default function CreatorPage({ id }: { id: number }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { creator, setCreator, getCreator } = useCreator(id);
    const { creatorWorks, setCreatorWorks, getCreatorWorks } = useCreatorWorks(id);

    
    function handleNameChange(id: number, value: string) {
        setCreator({...creator, name: value });
        api.updateCreatorName(id, value).catch((reason) => {
            getCreator();
            alert(reason);
        });
    }

    function handleAttachWork(workId: number) {
        api.attach(workId, id)
            .catch((reason) => { alert(reason); })
            .finally(() => { getCreatorWorks(); });
    }

    function handleDetachWork(workId: number) {
        api.detach(workId, id)
            .then(() => {
                setCreatorWorks(creatorWorks.filter((work) => work.id !== workId));
            })
            .catch((reason) => {
                getCreatorWorks();
                alert(reason);
            });
    }


    return (
        <div className="grow p-[5px] flex flex-col gap-y-[10px]">
            <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                <label className="whitespace-nowrap">Creator ID:</label>
                <label className="col-span-7">{creator.id}</label>
                <Button
                    onClick={() => {
                        confirm(`Delete work "${creator.name}"?`, { title: "Delete Creator", okLabel: "Yes", cancelLabel: "No", type: "warning" }).then(async (result) => {
                            if (result) {
                                await api.removeCreator(creator.id);
                                navigationDispatch({ action: "Clear" });
                            }
                        }).catch((reason) => { alert(reason); });
                    }}
                >Delete</Button>
                <label>Name:</label>
                <Input
                    className="col-span-8"
                    value={creator.name}
                    placeholder="Name"
                    onChange={(event) => { handleNameChange(creator.id, event.target.value); }}
                />
                <label>Works:</label>
                <label className="col-span-7">{creator.works}</label>
            </div>

            <div className="grow grid grid-cols-2 gap-x-[10px]">
                <div className="flex flex-col border border-neutral-700 rounded">
                    <label className="p-[5px] border-b border-neutral-700 ">Works:</label>
                    <WorksTable
                        works={creatorWorks}
                        storageKey={`CREATOR-WORKS-${id}-SORT-KEY`}
                        headerClassName="text-sm"
                        dataClassName="text-xs"
                        name
                        progress
                        status
                        type
                        format
                        updated
                        added
                        onDetachWork={handleDetachWork}
                    />
                </div>
                <AddWorksList creatorId={id} creatorWorks={creatorWorks} onAttachWork={handleAttachWork} />
            </div>
        </div>
    );
}
