import { FixedSizeList as List, areEqual } from "react-window";
import React, { type ChangeEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { type UpdateWork, getUpdateWorks, updateWorkName, updateWorkProgress } from "../../../api";
import AutoSizer from "react-virtualized-auto-sizer";
import memoize from "memoize-one";



type UpdateWorksListItemData = {
    updateWorks: UpdateWork[],
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

type UpdateRowProps = {
    index: number,
    style: React.CSSProperties,
    data: UpdateWorksListItemData
}

const UpdateRow = memo(({ index, style, data }: UpdateRowProps) => {
    const { updateWorks, onNameChange, onProgressChange } = data;
    const updateWork = updateWorks[index];
    if (!updateWork) {
        throw Error("Invalid update work for row generation.");
    }


    return (
        <div style={style} className="p-[10px] flex flex-col">
            <input
                className="grow"
                value={updateWork.name}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onNameChange(updateWork.id, event.target.value); }}
                spellCheck={false}
            />
            <input
                className="grow"
                value={updateWork.progress}
                onInput={(event: ChangeEvent<HTMLInputElement>) => { onProgressChange(updateWork.id, event.target.value); }}
                spellCheck={false}
            />
        </div>
    );
}, areEqual);


type UpdateWorksListProps = {
    height: number,
    width: number,
    updateWorks: UpdateWork[],
    onNameChange: (id: number, value: string) => void,
    onProgressChange: (id: number, value: string) => void
}

function UpdateWorksList({ height, width, updateWorks, onNameChange, onProgressChange }: UpdateWorksListProps) {
    const createItemData = memoize((itemData: UpdateWorksListItemData) => ({
        updateWorks: itemData.updateWorks,
        onNameChange: itemData.onNameChange,
        onProgressChange: itemData.onProgressChange
    }));
    const itemData = createItemData({updateWorks, onNameChange, onProgressChange});


    function generateItemKey(index: number, data: UpdateWorksListItemData): number {
        const item = data.updateWorks[index];
        if (!item) {
            throw Error("Invalid item for key generation.");
        }
        return item.id;
    }


    return (
        <List
            itemKey={generateItemKey}
            height={height}
            itemCount={updateWorks.length}
            itemData={itemData}
            itemSize={80}
            width={width}
        >{UpdateRow}</List>
    );
}


function useUpdateWorks() {
    const [filter, setFilter] = useState("");
    const [updateWorks, setUpdateWorks] = useState<UpdateWork[]>([]);
  
    const getWorks = useCallback(() => {
        getUpdateWorks(filter).then((value) => {
            setUpdateWorks(value);
        }).catch((reason) => { alert(reason); });
    }, [filter]);

    useEffect(() => {
        getWorks();
    }, [filter, getWorks]);
  
    return { filter, setFilter, updateWorks, setUpdateWorks, getWorks };
}


export default function UpdateTab() {
    const { filter, setFilter, updateWorks, setUpdateWorks, getWorks } = useUpdateWorks();
    const filterInput = useRef<HTMLInputElement>(null);


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

        updateWorkName(id, value).catch((reason) => {
            getWorks();
            console.error(`Failed to update work name in Update tab: ${reason}.`);
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

        updateWorkProgress(id, value).catch((reason) => {
            getWorks();
            console.error(`Failed to update work progress in Update tab: ${reason}.`);
        });
    }


    return (
        <div className="p-[10px] grow flex flex-col">
            <input
                ref={filterInput}
                value={filter}
                placeholder="Find"
                type="search"
                onInput={(event: ChangeEvent<HTMLInputElement>) => { setFilter(event.target.value); }}
            />

            <div className="grow overflow-hidden">
                <AutoSizer>
                    {({ height, width }) => (
                        <UpdateWorksList
                            height={height}
                            width={width}
                            updateWorks={updateWorks}
                            onNameChange={handleNameChange}
                            onProgressChange={handleProgressChange}
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
}
