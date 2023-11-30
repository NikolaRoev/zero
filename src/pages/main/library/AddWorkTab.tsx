import * as api from "../../../data/api";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import Button from "../../../components/Button";
import type { Creator } from "../../../data/api";
import DeleteButton from "../../../components/DeleteButton";
import Draggable from "../../../components/Draggable";
import Droppable from "../../../components/Droppable";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import { StorageKey } from "../../../data/storage";
import { Virtuoso } from "react-virtuoso";
import { useCreators } from "../../../hooks/creators";
import useFormats from "../../../hooks/formats";
import useSessionReducer from "../../../hooks/session-reducer";
import useSessionState from "../../../hooks/session-state";
import { useState } from "react";
import { useStatuses } from "../../../hooks/statuses";
import useTypes from "../../../hooks/types";



type AddWorkFormData = {
    name: string,
    progress: string,
    statusIndex: number,
    typeIndex: number,
    formatIndex: number,
    creators: Creator[]
}

const emptyAddWorkFormData: AddWorkFormData = {
    name: "",
    progress: "",
    statusIndex: 0,
    typeIndex: 0,
    formatIndex: 0,
    creators: []
};

type AddWorkFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "ChangeProgress", progress: string } |
    { action: "ChangeStatus", statusIndex: number } |
    { action: "ChangeType", typeIndex: number } |
    { action: "ChangeFormat", formatIndex: number } |
    { action: "AddCreator", creator: Creator } |
    { action: "RemoveCreator", id: number }



function addWorkFormReducer(addWorkFormData: AddWorkFormData, action: AddWorkFormAction): AddWorkFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddWorkFormData;
        }
        case "ChangeName": {
            return { ...addWorkFormData, name: action.name };
        }
        case "ChangeProgress": {
            return { ...addWorkFormData, progress: action.progress };
        }
        case "ChangeStatus": {
            return { ...addWorkFormData, statusIndex: action.statusIndex };
        }
        case "ChangeType": {
            return { ...addWorkFormData, typeIndex: action.typeIndex };
        }
        case "ChangeFormat": {
            return { ...addWorkFormData, formatIndex: action.formatIndex };
        }
        case "AddCreator": {
            if (!addWorkFormData.creators.find((creator) => creator.id === action.creator.id)) {
                return { ...addWorkFormData, creators: [...addWorkFormData.creators, action.creator] };
            }
            else {
                return addWorkFormData;
            }
        }
        case "RemoveCreator": {
            return { ...addWorkFormData, creators: addWorkFormData.creators.filter((creator) => creator.id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function AddWorkTab() {
    const { statuses } = useStatuses();
    const { types } = useTypes();
    const { formats } = useFormats();
    const { creators } = useCreators();
    const [creatorsFilter, setCreatorsFilter] = useSessionState(StorageKey.AddWorkCreatorsFilter, "");
    const [addWorkFormData, dispatch] = useSessionReducer(StorageKey.AddWorkFormData, addWorkFormReducer, emptyAddWorkFormData);

    const [activeItemData, setActiveItemData] = useState<Creator | null>(null);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const status = statuses[addWorkFormData.statusIndex]?.status;
        const type = types[addWorkFormData.typeIndex]?.type;
        const format = formats[addWorkFormData.formatIndex]?.format;

        if (status && type && format) {
            api.addWork(addWorkFormData.name, addWorkFormData.progress, status, type, format, addWorkFormData.creators.map((creator) => creator.id))
                .then(() => { dispatch({ action: "Clear" }); })
                .catch((reason) => { alert(reason); });
        }
    }

    function start(event: DragStartEvent) {
        const creator = event.active.data.current?.value as Creator;
        setActiveItemData(creator);
    }

    function test(event: DragEndEvent) {
        if (event.over) {
            const creator = event.active.data.current?.value as Creator;
            dispatch({ action: "AddCreator", creator: creator });
        }
        setActiveItemData(null);
    }


    const creatorsItems = creators.filter((creator) => creator.name.toLowerCase().includes(creatorsFilter.toLowerCase()));

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col grow">
                <div>
                    <Input
                        value={addWorkFormData.name}
                        onChange={(event) => { dispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                    <Input
                        value={addWorkFormData.progress}
                        onChange={(event) => { dispatch({ action: "ChangeProgress", progress: event.target.value }); }}
                        placeholder="Progress"
                        required={true}
                    />
                    <Select
                        value={addWorkFormData.statusIndex}
                        items={statuses.map((status, index) => ({ label: status.status, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeStatus", statusIndex: value}); }}
                        selectMsg="Select Status"
                        errorMsg="No Statuses"
                    />
                    <Select
                        value={addWorkFormData.typeIndex}
                        items={types.map((type, index) => ({ label: type.type, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeType", typeIndex: value}); }}
                        selectMsg="Select Type"
                        errorMsg="No Types"
                    />
                    <Select
                        value={addWorkFormData.formatIndex}
                        items={formats.map((format, index) => ({ label: format.format, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeFormat", formatIndex: value}); }}
                        selectMsg="Select Format"
                        errorMsg="No Formats"
                    />
                </div>
                <div className="grow flex border">
                    <DndContext onDragStart={start} onDragEnd={test}>
                        <div className="flex flex-col grow bg-slate-400">
                            <Input
                                value={creatorsFilter}
                                placeholder="Find"
                                type="search"
                                onChange={(event) => { setCreatorsFilter(event.target.value); }}
                            />
                            <Virtuoso
                                data={creatorsItems}
                                computeItemKey={(_, creator) => creator.id }
                                itemContent={(_, creator) => (
                                    <Draggable key={creator.id} id={creator.id} value={creator}>{creator.name}</Draggable>
                                )}
                            />
                        </div>

                        <DragOverlay dropAnimation={null}>
                            {activeItemData ? (
                                <div>{activeItemData.name}</div>
                            ): null}
                        </DragOverlay>

                        <Droppable id={"CREATORS-DROPPABLE"}>
                            {addWorkFormData.creators.map((creator) => (
                                <div key={creator.id}>
                                    <div>{creator.name}</div>
                                    <DeleteButton
                                        onClick={() => { dispatch({ action: "RemoveCreator", id: creator.id }); } }
                                        title={`Remove creator "${creator.name}".`}
                                    />
                                </div>
                            ))}
                        </Droppable>
                    </DndContext>
                </div>
                <Button>Add</Button>
            </form>
            <Button onClick={() => { dispatch({ action: "Clear" }); }}>Clear</Button>
        </>
    );
}
