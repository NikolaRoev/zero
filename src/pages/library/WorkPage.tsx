import * as api from "../../data/api";
import { useWork, useWorkCreators } from "../../hooks/works";
import Button from "../../components/Button";
import type { Creator } from "../../data/api";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import Select from "../../components/Select";
import { Virtuoso } from "react-virtuoso";
import { useCreators } from "../../hooks/creators";
import useFormats from "../../hooks/formats";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";
import { useStatuses } from "../../hooks/statuses";
import useTypes from "../../hooks/types";



function AddCreatorsList({ workId, workCreators, onAttachCreator, onDetachCreator }: { workId: number, workCreators: Creator[], onAttachCreator: (creatorId: number) => void, onDetachCreator: (creatorId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { creators } = useCreators();
    const [filter, setFilter] = useSessionState(`ADD-CREATORS-${workId}-KEY`, "");

    const creatorsItems = creators.filter((creator) => creator.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <div className="grow flex flex-col">
            <Input
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); } }
            />
            <Virtuoso
                data={creatorsItems}
                computeItemKey={(_, creator) => creator.id}
                itemContent={(_, creator) => {
                    const attached = workCreators.find((workCreator) => workCreator.id === creator.id) !== undefined;
                    return (
                        <div className="flex">
                            <div
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: creator.id } }); }}
                            >{creator.name}</div>
                            <button
                                className="disabled:bg-gray-300"
                                type="button"
                                onClick={() => {
                                    if (attached) {
                                        onDetachCreator(creator.id);
                                    }
                                    else {
                                        onAttachCreator(creator.id);
                                    }
                                }}
                            >{attached ? "-" : "+"}</button>
                        </div>
                    );
                }}
            />
        </div>
    );
}

function WorkCreatorsList({ workCreators, onDetachCreator }: { workCreators: Creator[], onDetachCreator: (creatorId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);

    return (
        <div className="grow">
            <Virtuoso
                data={workCreators}
                computeItemKey={(_, creator) => creator.id}
                itemContent={(index, creator) => (
                    <div key={creator.id}>
                        <p>{index + 1}.</p>
                        <p onClick={() => { navigationDispatch({ action: "New", page: { id: creator.id, type: "Creator" }}); }}>{creator.name}</p>
                        <p>Works: {creator.works}</p>
                        <p>ID: {creator.id}</p>
                        <Button onClick={() => { onDetachCreator(creator.id); }}>REMOVE</Button>
                    </div>
                )}
            />
        </div>
    );
}

export default function WorkPage({ id }: { id: number }) {
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
        <div className="flex flex-col grow">
            <label>ID: {work.id}</label>
            <Input
                value={work.name}
                placeholder="Name"
                onChange={(event) => { handleNameChange(work.id, event.target.value); }}
            />
            <Input
                value={work.progress}
                placeholder="Progress"
                onChange={(event) => { handleProgressChange(work.id, event.target.value); }}
            />
            <Select
                value={work.status}
                items={statuses.map((status) => ({ label: status.status, value: status.status }))}
                onChange={(value) => { handleStatusChange(work.id, value); }}
                selectMsg="Change Status"
            />
            <Select
                value={work.type}
                items={types.map((type) => ({ label: type.type, value: type.type }))}
                onChange={(value) => { handleTypeChange(work.id, value); }}
                selectMsg="Change Type"
            />
            <Select
                value={work.format}
                items={formats.map((format) => ({ label: format.format, value: format.format }))}
                onChange={(value) => { handleFormatChange(work.id, value); }}
                selectMsg="Change Format"
            />
            <label>Updated: {work.updated}</label>
            <label>Added: {work.added}</label>

            <div className="flex grow">
                <WorkCreatorsList workCreators={workCreators} onDetachCreator={handleDetachCreator}/>
                <AddCreatorsList workId={id} workCreators={workCreators} onAttachCreator={handleAttachCreator} onDetachCreator={handleDetachCreator}/>
            </div>
        </div>
    );
}
