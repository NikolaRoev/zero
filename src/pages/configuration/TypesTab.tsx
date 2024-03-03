import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { SortableItem, SortableList } from "../../components/SortableList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";



function TypesList() {
    const { types, removeType, updateTypeName, reorderTypes } = useSafeContext(DataContext);

    return (
        <SortableList
            data={types}
            onDragEnd={(event) => {
                if (event.over && event.active.id !== event.over.id) {
                    reorderTypes(event.active.id as number, event.over.id as number);
                }
            }}
            generateDragContent={(id) => {
                const type = types.find((type) => type.id === id);
                return (
                    <span className="p-[5px]">{type?.name}</span>
                );
            }}
            itemContent={(index, type) => (
                <SortableItem key={type.id} id={type.id} className={clsx({ "bg-neutral-100": index % 2 })}>
                    <>
                        <input
                            name={`update-type-input-${type.id}`}
                            className={clsx(
                                "grow p-[5px] bg-transparent focus:outline-none rounded"
                            )}
                            value={type.name}
                            spellCheck={false}
                            autoComplete="off"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                updateTypeName(type.id, event.target.value);
                            }}
                        />
                        <DeleteButton
                            title={`Remove type "${type.name}".`}
                            onClick={() => { removeType(type.id); }}
                        />
                    </>
                </SortableItem>
            )}
        />
    );
}


export default function TypesTab() {
    const { addType } = useSafeContext(DataContext);
    const [typeInput, setTypeInput] = useState("");
    const typeInputRef = useRef<HTMLInputElement>(null);
    const addButtonRef = useRef<HTMLButtonElement>(null);


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (addButtonRef.current) { addButtonRef.current.disabled = true; }

        addType(typeInput, () => {
            setTypeInput("");
            if (typeInputRef.current?.value) { typeInputRef.current.value = ""; }
        }, () => { if (addButtonRef.current) { addButtonRef.current.disabled = false; } });
    }


    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={typeInputRef}
                    name="type-add-input"
                    className="grow"
                    value={typeInput}
                    onChange={(event) => { setTypeInput(event.target.value); }}
                    placeholder="Type"
                    required={true}
                    autoFocus
                />
                <Button ref={addButtonRef}>Add</Button>
            </form>
            <TypesList />
        </div>
    );
}
