import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage";
import { Virtuoso } from "react-virtuoso";
import type { Work } from "../../data/api";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state";



type UpdateWorkRowProps = {
    updateWork: Work,
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

function UpdateWorkRow(props: UpdateWorkRowProps) {
    return (
        <div className="px-[15px] py-[10px] flex flex-col bg-neutral-50">
            <input
                className="text-[14px] grow focus:outline-none overflow-ellipsis bg-neutral-50"
                value={props.updateWork.name}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    props.onNameChange(props.updateWork.id, event.target.value);
                }}
                spellCheck={false}
            />
            <input
                className="text-[14px] grow focus:outline-none overflow-ellipsis bg-neutral-50"
                value={props.updateWork.progress}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    props.onProgressChange(props.updateWork.id, event.target.value);
                }}
                spellCheck={false}
            />
        </div>
    );
}


export default function UpdateTab() {
    const { works, statuses, updateWorkName, updateWorkProgress } = useSafeContext(DataContext);
    const filterInput = useRef<HTMLInputElement>(null);
    const [filter, setFilter] = useSessionState(StorageKey.UpdateFilter, "");
    const [editingIds, setEditingIds] = useState<number[]>([]);


    useEffect(() => {
        const handleFindEvent = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "f") {
                event.preventDefault();
                filterInput.current?.focus();
                filterInput.current?.select();
            }
        };
        window.addEventListener("keydown", handleFindEvent);

        return () => {
            window.removeEventListener("keydown", handleFindEvent);
        };
    }, []);


    const updateStatuses = statuses.filter((status) => status.isUpdate);
    const updateWorks = Array.from(works.values()).filter((work) => updateStatuses.find((status) => status.status === work.status));
    const updateWorksItems = updateWorks.filter((work) => (
        work.name.toLowerCase().includes(filter.toLowerCase()) || editingIds.includes(work.id)
    ));

    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px] bg-neutral-50">
            <Input
                ref={filterInput}
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => {
                    setFilter(event.target.value);
                    setEditingIds([]);
                }}
            />

            <Virtuoso
                data={updateWorksItems}
                computeItemKey={(_, updateWork) => updateWork.id }
                itemContent={(_, updateWork) => (
                    <UpdateWorkRow
                        updateWork={updateWork}
                        onNameChange={(id, value) => {
                            updateWorkName(id, value);
                            setEditingIds([...editingIds, id]);
                        }}
                        onProgressChange={(id, value) => {
                            updateWorkProgress(id, value);
                            setEditingIds([...editingIds, id]);
                        }}
                    />
                )}
            />
        </div>
    );
}
