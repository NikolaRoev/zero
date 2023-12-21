import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import RemoveList from "../../components/RemoveList";
import clsx from "clsx";
import useSafeContext from "../../hooks/safe-context-hook";



function StatusesList() {
    const { statuses, removeStatus, updateStatus } = useSafeContext(DataContext);

    return (
        <div className="grow border border-neutral-700 rounded-[5px]">
            <RemoveList
                data={statuses}
                computeItemKey={(_, status) => status.id }
                itemContent={(_, status) => ({
                    contents: (
                        <>
                            <p className={clsx("grow p-[5px]", { "underline": status.isUpdate })}>{status.status}</p>
                            <input
                                className="mx-[10px]"
                                type="checkbox"
                                checked={status.isUpdate}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    updateStatus(status.id, event.target.checked);
                                }}
                                title="Is Update."
                            />
                        </>
                    ),
                    buttonTitle: `Remove status "${status.status}".`,
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
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={statusInputRef}
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
