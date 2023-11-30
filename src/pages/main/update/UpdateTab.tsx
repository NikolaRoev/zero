import * as api from "../../../data/api";
import { type ChangeEvent, useEffect, useRef } from "react";
import Input from "../../../components/Input";
import { StorageKey } from "../../../data/storage";
import type { UpdateWork } from "../../../data/api";
import { Virtuoso } from "react-virtuoso";
import useSessionState from "../../../hooks/session-state";
import { useUpdateWorks } from "../../../hooks/works";



type UpdateWorkRowProps = {
    updateWork: UpdateWork,
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

function UpdateWorkRow({ updateWork, onNameChange, onProgressChange }: UpdateWorkRowProps) {
    return (
        <div className="px-[20px] py-[10px] flex flex-col">
            <input
                className="text-[14px] grow focus:outline-none overflow-ellipsis"
                value={updateWork.name}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onNameChange(updateWork.id, event.target.value); }}
                spellCheck={false}
            />
            <input
                className="text-[14px] grow focus:outline-none overflow-ellipsis"
                value={updateWork.progress}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onProgressChange(updateWork.id, event.target.value); }}
                spellCheck={false}
            />
        </div>
    );
}



export default function UpdateTab() {
    const filterInput = useRef<HTMLInputElement>(null);
    const [filter, setFilter] = useSessionState(StorageKey.UpdateFilter, "");
    const { updateWorks, setUpdateWorks, getUpdateWorks } = useUpdateWorks();


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


    function handleNameChange(id: number, value: string) {
        setUpdateWorks(updateWorks.map((updateWork) => {
            if (updateWork.id === id) {
                return { ...updateWork, name: value };
            }
            else {
                return updateWork;
            }
        }));

        api.updateWorkName(id, value).catch((reason) => {
            getUpdateWorks();
            alert(reason);
        });
    }

    function handleProgressChange(id: number, value: string) {
        setUpdateWorks(updateWorks.map((updateWork) => {
            if (updateWork.id === id) {
                return { ...updateWork, progress: value };
            }
            else {
                return updateWork;
            }
        }));

        api.updateWorkProgress(id, value).catch((reason) => {
            getUpdateWorks();
            alert(reason);
        });
    }


    const updateWorksItems = updateWorks.filter((work) => work.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="grow flex flex-col gap-y-[10px]">
            <Input
                ref={filterInput}
                value={filter}
                placeholder="Find"
                type="search"
                onChange={(event) => { setFilter(event.target.value); }}
            />

            <Virtuoso
                data={updateWorksItems}
                computeItemKey={(_, updateWork) => updateWork.id }
                itemContent={(_, updateWork) => (
                    <UpdateWorkRow
                        updateWork={updateWork}
                        onNameChange={handleNameChange}
                        onProgressChange={handleProgressChange}
                    />
                )}
            />
        </div>
    );
}
