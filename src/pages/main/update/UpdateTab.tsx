import * as api from "../../../api";
import { type ChangeEvent, useCallback, useEffect, useRef, useState, memo } from "react";
import Input from "../../../utility/Input";
import type { UpdateWork } from "../../../api";
import { Virtuoso } from "react-virtuoso";
import { listen } from "@tauri-apps/api/event";



type UpdateWorkRowProps = {
    updateWork: UpdateWork,
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

const UpdateWorkRow = memo(function ({ updateWork, onNameChange, onProgressChange }: UpdateWorkRowProps) {
    return (
        <div className="p-[10px] flex flex-col">
            <Input
                value={updateWork.name}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onNameChange(updateWork.id, event.target.value); }}
            />
            <Input
                value={updateWork.progress}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onProgressChange(updateWork.id, event.target.value); }}
            />
        </div>
    );
});


function useUpdateWorks() {
    const [filter, setFilter] = useState("");
    const [updateWorks, setUpdateWorks] = useState<UpdateWork[]>([]);
  
    const getUpdateWorks = useCallback((name: string) => {
        api.getUpdateWorks(name).then((value) => {
            setUpdateWorks(value);
        }).catch((reason) => { alert(reason); });
    }, []);

    useEffect(() => {
        getUpdateWorks(filter);
    }, [filter, getUpdateWorks]);

    return { filter, setFilter, updateWorks, setUpdateWorks, getUpdateWorks };
}


export default function UpdateTab() {
    const filterInput = useRef<HTMLInputElement>(null);
    const { filter, setFilter, updateWorks, setUpdateWorks, getUpdateWorks } = useUpdateWorks();


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

    useEffect(() => {
        listen(api.CHANGED_STATUS_ISUPDATE_EVENT, () => {
            getUpdateWorks(filterInput.current?.value ?? "");
        }).catch(async (reason) => {
            await api.error(`Failed to listen for changed status update event in Update tab: ${reason}`);
        });
    }, [getUpdateWorks]);


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
            getUpdateWorks(filter);
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
            getUpdateWorks(filter);
            alert(reason);
        });
    }


    return (
        <div className="grow flex flex-col gap-y-[10px]">
            <Input
                ref={filterInput}
                value={filter}
                placeholder="Find"
                type="search"
                onInput={(event: ChangeEvent<HTMLInputElement>) => { setFilter(event.target.value); }}
            />

            <Virtuoso
                data={updateWorks}
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
