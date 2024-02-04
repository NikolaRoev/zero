import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { SortableItem, SortableList } from "../../components/SortableList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";



function FormatsList() {
    const { formats, removeFormat, updateFormatName, reorderFormats } = useSafeContext(DataContext);

    return (
        <SortableList
            data={formats}
            onDragEnd={(event) => {
                if (event.over && event.active.id !== event.over.id) {
                    reorderFormats(event.active.id as number, event.over.id as number);
                }
            }}
            generateDragContent={(id) => {
                const format = formats.find((format) => format.id === id);
                return (
                    <span className="p-[5px]">{format?.name}</span>
                );
            }}
            itemContent={(index, format) => (
                <SortableItem key={format.id} id={format.id} className={clsx({ "bg-neutral-100": index % 2 })}>
                    <>
                        <input
                            name={`update-format-input-${format.id}`}
                            className={clsx(
                                "grow p-[5px] bg-transparent focus:outline-none rounded"
                            )}
                            value={format.name}
                            spellCheck={false}
                            autoComplete="off"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                updateFormatName(format.id, event.target.value);
                            }}
                        />
                        <DeleteButton
                            title={`Remove format "${format.name}".`}
                            onClick={() => { removeFormat(format.id); }}
                        />
                    </>
                </SortableItem>
            )}
        />
    );
}


export default function FormatsTab() {
    const { addFormat } = useSafeContext(DataContext);
    const [formatInput, setFormatInput] = useState("");
    const formatInputRef = useRef<HTMLInputElement>(null);


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addFormat(formatInput, () => {
            setFormatInput("");
            if (formatInputRef.current?.value) { formatInputRef.current.value = ""; }
        });
    }


    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={formatInputRef}
                    name="format-add-input"
                    className="grow"
                    value={formatInput}
                    onChange={(event) => { setFormatInput(event.target.value); }}
                    placeholder="Format"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <FormatsList />
        </div>
    );
}
