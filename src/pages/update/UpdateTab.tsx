import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { type ComparatorType, SearchInput } from "../../components/SearchInput";
import { DataContext } from "../../contexts/data-context";
import { StorageKey } from "../../data/storage";
import { Virtuoso } from "react-virtuoso";
import type { Work } from "../../data/data";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state-hook";



type UpdateWorkRowProps = {
    updateWork: Work,
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

function UpdateWorkRow(props: UpdateWorkRowProps) {
    return (
        <div className="px-[20px] py-[10px] flex flex-col bg-neutral-50">
            <input
                name={`update-name-input-${props.updateWork.id}`}
                className="text-[14px] grow focus:outline-none overflow-ellipsis bg-neutral-50"
                value={props.updateWork.name}
                spellCheck={false}
                autoComplete="off"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    props.onNameChange(props.updateWork.id, event.target.value);
                }}
            />
            <input
                name={`update-progress-input-${props.updateWork.id}`}
                className="text-[14px] grow focus:outline-none overflow-ellipsis bg-neutral-50"
                value={props.updateWork.progress}
                spellCheck={false}
                autoComplete="off"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    props.onProgressChange(props.updateWork.id, event.target.value);
                }}
            />
        </div>
    );
}


export default function UpdateTab() {
    const { works, statuses, updateWorkName, updateWorkProgress } = useSafeContext(DataContext);
    const filterInput = useRef<HTMLInputElement>(null);
    const [filter, setFilter] = useSessionState<{ value: string, comparatorType: ComparatorType }>(
        StorageKey.UpdateFilter, { value: "", comparatorType: "None" }
    );
    const [comparator, setComparator] = useState<(value: string) => boolean>(() => () => false);
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


    const updateStatuses = Array.from(statuses.values()).filter((status) => status.isUpdate);
    const updateWorks = Array.from(works.values()).filter((work) => updateStatuses.find((status) => status.id === work.status));
    const updateWorksItems = updateWorks.filter((work) => comparator(work.name) || editingIds.includes(work.id));

    return (
        <div className="grow flex flex-col gap-y-[10px] bg-neutral-50">
            <SearchInput
                ref={filterInput}
                setComparator={setComparator}
                filter={filter.value}
                comparatorType={filter.comparatorType}
                setComparatorType={(newComparatorType) => { setFilter({ ...filter, comparatorType: newComparatorType }); } }
                name={"update-search-input"}
                onChange={(event) => {
                    setFilter({ ...filter, value: event.target.value });
                    setEditingIds([]);
                }}
                className="mx-[5px] mt-[10px]"
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
