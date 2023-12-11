import * as api from "../../data/api";
import { useWork, useWorkCreators } from "../../hooks/works";
import AddCreatorsList from "../../components/AddCreatorsList";
import Button from "../../components/Button";
import type { Creator } from "../../data/api";
import CreatorsTable from "../../components/CreatorsTable";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import Select from "../../components/Select";
import { confirm } from "@tauri-apps/api/dialog";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "react-toastify";
import useFormats from "../../hooks/formats";
import useSafeContext from "../../hooks/safe-context-hook";
import { useStatuses } from "../../hooks/statuses";
import useTypes from "../../hooks/types";



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

    function handleAttachCreator(creator: Creator) {
        api.attach(id, creator.id)
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
                                toast(`Deleted work "${work.name}".`);
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
                <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                    <AddCreatorsList
                        workCreators={workCreators}
                        storageKey={`ADD-CREATORS-${id}-KEY`}
                        onButtonClick={handleAttachCreator}
                    />
                </div>
            </div>
        </div>
    );
}
