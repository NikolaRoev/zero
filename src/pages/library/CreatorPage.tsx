import * as api from "../../data/api";
import { useCreator, useCreatorWorks } from "../../hooks/creators";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { Virtuoso } from "react-virtuoso";
import type { Work } from "../../data/api";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";
import { useWorks } from "../../hooks/works";



function AddWorksList({ creatorId, creatorWorks, onAttachWork, onDetachWork }: { creatorId: number, creatorWorks: Work[], onAttachWork: (workId: number) => void, onDetachWork: (workId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { works } = useWorks();
    const [filter, setFilter] = useSessionState(`ADD-WORKS-${creatorId}-KEY`, "");

    const worksItems = works.filter((work) => work.name.toLowerCase().includes(filter.toLowerCase()));
    
    return (
        <div className="grow flex flex-col">
            <Input
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); } }
            />
            <Virtuoso
                data={worksItems}
                computeItemKey={(_, work) => work.id}
                itemContent={(_, work) => {
                    const attached = creatorWorks.find((creatorWork) => creatorWork.id === work.id) !== undefined;
                    return (
                        <div className="flex">
                            <div
                                onClick={() => { navigationDispatch({ action: "New", page: { type: "Work", id: work.id } }); }}
                            >{work.name}</div>
                            <button
                                className="disabled:bg-gray-300"
                                type="button"
                                onClick={() => {
                                    if (attached) {
                                        onDetachWork(work.id);
                                    }
                                    else {
                                        onAttachWork(work.id);
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

function CreatorWorksList({ creatorWorks, onDetachWork }: { creatorWorks: Work[], onDetachWork: (workId: number) => void }) {
    const { navigationDispatch } = useSafeContext(NavigationContext);

    return (
        <div className="grow">
            <Virtuoso
                data={creatorWorks}
                computeItemKey={(_, work) => work.id}
                itemContent={(index, work) => (
                    <div key={work.id} >
                        <p>{index + 1}.</p>
                        <p onClick={() => { navigationDispatch({ action: "New", page: { id: work.id, type: "Work" }}); }}>{work.name}</p>
                        <p>Progress: {work.progress}</p>
                        <p>Status: {work.status}</p>
                        <p>Type: {work.type}</p>
                        <p>Format: {work.format}</p>
                        <p>Updated: {work.updated}</p>
                        <p>Added: {work.added}</p>
                        <Button onClick={() => { onDetachWork(work.id); }}>REMOVE</Button>
                    </div>
                )}
            />
        </div>
    );
}

export default function CreatorPage({ id }: { id: number }) {
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
        <div className="flex flex-col grow">
            <label>ID: {creator.id}</label>
            <Input
                value={creator.name}
                placeholder="Name"
                onChange={(event) => { handleNameChange(creator.id, event.target.value); }}
            />
            <label>Works: {creator.works}</label>

            <div className="flex grow">
                <CreatorWorksList creatorWorks={creatorWorks} onDetachWork={handleDetachWork}/>
                <AddWorksList creatorId={id} creatorWorks={creatorWorks} onAttachWork={handleAttachWork} onDetachWork={handleDetachWork}/>
            </div>
        </div>
    );
}
