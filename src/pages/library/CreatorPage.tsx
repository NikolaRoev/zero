import * as api from "../../data/api";
import AddWorksList from "../../components/AddWorksList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import type { Work } from "../../data/api";
import WorksTable from "../../components/WorksTable";
import { confirm } from "@tauri-apps/api/dialog";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";



export default function CreatorPage({ id }: { id: number }) {
    const dataContext = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const creator = dataContext.creators.get(id);

    const creatorWorks: Work[] = [];
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
                <label className="whitespace-nowrap">Creator ID:</label>
                <label className="col-span-7">{creator.id}</label>
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
                <label>Name:</label>
                <Input
                    className="col-span-8"
                    value={creator.name}
                    placeholder="Name"
                    onChange={(event) => { dataContext.updateCreatorName(creator.id, event.target.value); }}
                />
                <label>Works:</label>
                <label className="col-span-7">{creator.works.length}</label>
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
                        onDetachWork={(workId) => { dataContext.detach(workId, id); }}
                    />
                </div>
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddWorksList
                        storageKey={`ADD-WORKS-${id}-KEY`}
                        creatorWorks={creatorWorks}
                        onButtonClick={(workId) => { dataContext.attach(workId, id); }}
                    />
                </div>
            </div>
        </div>
    );
}
