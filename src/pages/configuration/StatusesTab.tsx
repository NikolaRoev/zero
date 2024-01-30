import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import RemoveList from "../../components/RemoveList";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";



function StatusesList() {
    const { statuses, removeStatus, updateStatusName, updateStatusIsUpdate } = useSafeContext(DataContext);

    return (
        <div className="grow border border-neutral-700 rounded">
            <RemoveList
                data={Array.from(statuses.values())}
                computeItemKey={(_, status) => status.id }
                itemContent={(_, status) => ({
                    contents: (
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
                        </>
                    ),
                    buttonTitle: `Remove status "${status.name}".`,
                    onButtonClick: () => { removeStatus(status.id); }
                })}
            />
        </div>
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
                />
                <Button>Add</Button>
            </form>
            <StatusesList />
        </div>
    );
}
