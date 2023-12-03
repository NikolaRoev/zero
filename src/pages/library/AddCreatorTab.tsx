import * as api from "../../data/api";
import type { Creator, Work } from "../../data/api";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Draggable from "../../components/Draggable";
import Droppable from "../../components/Droppable";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import { Virtuoso } from "react-virtuoso";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer";
import useSessionState from "../../hooks/session-state";
import { useState } from "react";
import { useWorks } from "../../hooks/works";



type AddCreatorFormData = {
    name: string,
    works: Work[]
}

const emptyAddCreatorFormData: AddCreatorFormData = {
    name: "",
    works: []
};

type AddCreatorFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "AddWork", work: Work } |
    { action: "RemoveWork", id: number }



function addCreatorFormReducer(addCreatorFormData: AddCreatorFormData, action: AddCreatorFormAction): AddCreatorFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddCreatorFormData;
        }
        case "ChangeName": {
            return { ...addCreatorFormData, name: action.name };
        }
        case "AddWork": {
            if (!addCreatorFormData.works.find((work) => work.id === action.work.id)) {
                return { ...addCreatorFormData, works: [...addCreatorFormData.works, action.work] };
            }
            else {
                return addCreatorFormData;
            }
        }
        case "RemoveWork": {
            return { ...addCreatorFormData, works: addCreatorFormData.works.filter((work) => work.id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function AddCreatorTab() {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const { works } = useWorks();
    const [worksFilter, setWorksFilter] = useSessionState(StorageKey.AddCreatorWorksFilter, "");
    const [addCreatorFormData, dispatch] = useSessionReducer(StorageKey.AddCreatorFormData, addCreatorFormReducer, emptyAddCreatorFormData);

    const [activeItemData, setActiveItemData] = useState<Creator | null>(null);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addCreator(addCreatorFormData.name, addCreatorFormData.works.map((work) => work.id))
            .then(() => { dispatch({ action: "Clear" }); })
            .catch((reason) => { alert(reason); });
    }

    function start(event: DragStartEvent) {
        const creator = event.active.data.current?.value as Creator;
        setActiveItemData(creator);
    }

    function test(event: DragEndEvent) {
        if (event.over) {
            const work = event.active.data.current?.value as Work;
            dispatch({ action: "AddWork", work: work });
        }
        setActiveItemData(null);
    }

    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10
            }
        })
    );


    const worksItems = works.filter((work) => work.name.toLowerCase().includes(worksFilter.toLowerCase()));

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col grow">
                <div>
                    <Input
                        value={addCreatorFormData.name}
                        onChange={(event) => { dispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                </div>
                <div className="grow flex border">
                    <DndContext onDragStart={start} onDragEnd={test} sensors={sensors}>
                        <div className="flex flex-col grow bg-slate-400">
                            <Input
                                value={worksFilter}
                                placeholder="Find"
                                type="search"
                                onChange={(event) => { setWorksFilter(event.target.value); }}
                            />
                            <Virtuoso
                                data={worksItems}
                                computeItemKey={(_, work) => work.id }
                                itemContent={(_, work) => (
                                    <div className="flex">
                                        <Draggable
                                            key={work.id}
                                            id={work.id}
                                            value={work}
                                            onClick={() => { navigationDispatch({ action: "New", page: { id: work.id, type: "Work" } }); }}
                                        >{work.name}</Draggable>
                                        <button
                                            type="button"
                                            onClick={() => { dispatch({ action: "AddWork", work: work }); }}
                                        >{">"}</button>
                                    </div>
                                )}
                            />
                        </div>

                        <DragOverlay dropAnimation={null}>
                            {activeItemData ? (
                                <div>{activeItemData.name}</div>
                            ): null}
                        </DragOverlay>

                        <Droppable id={"WORKS-DROPPABLE"}>
                            {addCreatorFormData.works.map((work) => (
                                <div key={work.id}>
                                    <div>{work.name}</div>
                                    <DeleteButton
                                        onClick={() => { dispatch({ action: "RemoveWork", id: work.id }); } }
                                        title={`Remove work "${work.name}".`}
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
