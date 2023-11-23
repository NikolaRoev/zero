import * as api from "../../../api";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { type UnlistenFn, listen } from "@tauri-apps/api/event";
import Input from "../../../utility/Input";
import type { UpdateWork } from "../../../api";
import { Virtuoso } from "react-virtuoso";



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
        const unlisten = listen(api.CHANGED_STATUS_ISUPDATE_EVENT, () => {
            getUpdateWorks(filterInput.current?.value ?? "");
        }).catch(async (reason) => {
            await api.error(`Failed to listen for changed status update event in Update tab: ${reason}`);
        });

        return () => {
            unlisten.then((f: UnlistenFn) => { f(); }).catch(async (reason) => {
                await api.error(`Failed to unlisten for changed status update event in Update tab: ${reason}`);
            });
        };
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
