import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { SortableItem, SortableList } from "../../components/SortableList";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";



function StatusesList() {
    const { statuses, removeStatus, updateStatusName, updateStatusIsUpdate, reorderStatuses } = useSafeContext(DataContext);

    return (
        <SortableList
            data={statuses}
            onDragEnd={(event) => {
                if (event.over && event.active.id !== event.over.id) {
                    reorderStatuses(event.active.id as number, event.over.id as number);
                }
            }}
            generateDragContent={(id) => {
                const status = statuses.find((status) => status.id === id);
                return (
                    <span className={clsx("p-[5px]", { "underline": status?.isUpdate })}>{status?.name}</span>
                );
            }}
            itemContent={(index, status) => (
                <SortableItem key={status.id} id={status.id} className={clsx({ "bg-neutral-100": index % 2 })}>
                    <>
                        <input
                            name={`update-status-input-${status.id}`}
                            className={clsx(
                                "grow p-[5px] bg-transparent focus:outline-none rounded",
                                { "underline": status.isUpdate }
                            )}
                            value={status.name}
                            spellCheck={false}
                            autoComplete="off"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                updateStatusName(status.id, event.target.value);
                            }}
                        />
                        <input
                            name={`status-${status.id}-is-update-checkbox`}
                            className="mx-[10px]"
                            type="checkbox"
                            checked={status.isUpdate}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                updateStatusIsUpdate(status.id, event.target.checked);
                            }}
                            title="Is Update."
                        />
                        <DeleteButton
                            title={`Remove status "${status.name}".`}
                            onClick={() => { removeStatus(status.id); }}
                        />
                    </>
                </SortableItem>
            )}
        />
    );
}


export default function StatusesTab() {
    const { addStatus } = useSafeContext(DataContext);
    const [statusInput, setStatusInput] = useState("");
    const statusInputRef = useRef<HTMLInputElement>(null);


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addStatus(statusInput, () => {
            setStatusInput("");
            if (statusInputRef.current?.value) { statusInputRef.current.value = ""; }
        });
        
    }


    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={statusInputRef}
                    name="status-add-input"
                    className="grow"
                    value={statusInput}
                    onChange={(event) => { setStatusInput(event.target.value); }}
                    placeholder="Status"
                    required={true}
                    autoFocus
                />
                <Button>Add</Button>
            </form>
            <StatusesList />
        </div>
    );
}
