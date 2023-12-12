import * as api from "../../data/api";
import type { Creator, Work } from "../../data/api";
import { useCreator, useCreatorWorks } from "../../hooks/creators";
import AddWorksList from "../../components/AddWorksList";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import WorksTable from "../../components/WorksTable";
import { confirm } from "@tauri-apps/api/dialog";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";



export default function CreatorPage({ id }: { id: number }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { creator, setCreator, getCreator } = useCreator(id);
    const { creatorWorks, setCreatorWorks, getCreatorWorks } = useCreatorWorks(id);

    
    function handleNameChange(creator: Creator, value: string) {
        setCreator({...creator, name: value });
        api.updateCreatorName(id, value).catch((reason) => {
            getCreator();
            alert(reason);
        });
    }

    function handleAttachWork(work: Work) {
        api.attach(work.id, id)
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
        creator && <div className="grow p-[5px] flex flex-col gap-y-[10px]">
            <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                <label className="whitespace-nowrap">Creator ID:</label>
                <label className="col-span-7">{creator.id}</label>
                <Button
                    onClick={() => {
                        confirm(`Delete creator "${creator.name}"?`, { title: "Delete Creator", okLabel: "Yes", cancelLabel: "No", type: "warning" }).then(async (result) => {
                            if (result) {
                                await api.removeCreator(creator.id);
                                toast(`Deleted creator "${creator.name}".`);
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
                    onChange={(event) => { handleNameChange(creator, event.target.value); }}
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
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddWorksList
                        storageKey={`ADD-WORKS-${id}-KEY`}
                        creatorWorks={creatorWorks}
                        onButtonClick={handleAttachWork}
                    />
                </div>
            </div>
        </div>
    );
}
