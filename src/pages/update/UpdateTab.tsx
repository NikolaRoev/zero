import { type ChangeEvent, useState } from "react";
import { type ComparatorType, SearchInput } from "../../components/SearchInput";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { DataContext } from "../../contexts/data-context";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import { Virtuoso } from "react-virtuoso";
import type { Work } from "../../data/data";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionState from "../../hooks/session-state-hook";



type UpdateWorkRowProps = {
    updateWork: Work,
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void,
    jumpTo: (id: number) => void
}

function UpdateWorkRow(props: UpdateWorkRowProps) {
    return (
        <div className="pl-[20px] pr-[10px] flex grow bg-neutral-50">
            <div className="pr-[10px] py-[10px] flex flex-col grow">
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
            <button
                className="p-[5px] hover:bg-neutral-200 active:bg-neutral-300 rounded"
                onClick={() => { props.jumpTo(props.updateWork.id); }}
            ><BsBoxArrowUpRight className="w-[13px] h-[13px] fill-neutral-500"/></button>
        </div>
    );
}


export default function UpdateTab() {
    const { works, statuses, updateWorkName, updateWorkProgress } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [filter, setFilter] = useSessionState<{ value: string, comparatorType: ComparatorType, editDistance: number }>(
        StorageKey.UpdateFilter, { value: "", comparatorType: "None", editDistance: 5 }
    );
    const [comparator, setComparator] = useState<(value: string) => boolean>(() => () => false);
    const [editingIds, setEditingIds] = useState<number[]>([]);

    const updateStatuses = statuses.filter((status) => status.isUpdate);
    const updateWorks = Array.from(works.values()).filter((work) => updateStatuses.find((status) => status.id === work.status));
    const updateWorksItems = updateWorks.filter((work) => comparator(work.name) || editingIds.includes(work.id));

    return (
        <div className="grow flex flex-col gap-y-[10px] bg-neutral-50">
            <SearchInput
                setComparator={setComparator}
                filter={filter.value}
                comparatorType={filter.comparatorType}
                setComparatorType={(newComparatorType) => { setFilter({ ...filter, comparatorType: newComparatorType }); }}
                editDistance={filter.editDistance}
                setEditDistance={(editDistance) => { setFilter({ ...filter, editDistance: editDistance }); }}
                name={"update-search-input"}
                onChange={(event) => {
                    setFilter({ ...filter, value: event.target.value });
                    setEditingIds([]);
                }}
                className="mx-[5px] mt-[10px]"
                autoFocus
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
                        jumpTo={(id) => {
                            navigationDispatch({ action: "Jump To", page: { type: "Work", id: id } });
                        }}
                    />
                )}
            />
        </div>
    );
}
