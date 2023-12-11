import * as api from "../../data/api";
import { type ChangeEvent, type FormEvent, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import type { Status } from "../../data/api";
import { StorageKey } from "../../data/storage";
import clsx from "clsx";
import { useStatuses } from "../../hooks/statuses";



type StatusesListProps = {
    statuses: Status[],
    removeStatus: (id: number) => void,
    toggleStatus: (id: number, isUpdate: boolean) => void,
}
function StatusesList({ statuses, removeStatus, toggleStatus }: StatusesListProps) {
    const statusesItems = statuses.map((status) => (
        <div key={status.id} className="flex even:bg-neutral-200">
            <p className={clsx("grow p-[5px]", { "underline": status.isUpdate })}>{status.status}</p>
            <input
                className="mx-[10px]"
                type="checkbox"
                checked={status.isUpdate}
                onChange={(event: ChangeEvent<HTMLInputElement>) => { toggleStatus(status.id, event.target.checked); }}
                title="Is Update."
            />
            <DeleteButton
                onClick={() => { removeStatus(status.id); } }
                title={`Remove status "${status.status}".`}
            />
        </div>
    ));

    return <div className="grow border border-neutral-700 rounded-[5px] overflow-y-auto">{statusesItems}</div>;
}


export default function StatusesTab() {
    const { statuses, setStatuses, getStatuses } = useStatuses();
    const [statusInput, setStatusInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addStatus(statusInput).then((id) => {
            setStatuses([...statuses, { id: id, status: statusInput, isUpdate: false }]);
            setStatusInput("");
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function removeStatus(id: number) {
        api.removeStatus(id).then(() => {
            setStatuses(statuses.filter((status) => status.id !== id));
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function toggleStatus(id: number, isUpdate: boolean) {
        api.updateStatus(id, isUpdate).then(() => {
            setStatuses(statuses.map((status) => {
                if (status.id === id) {
                    return { ...status, isUpdate: isUpdate };
                }
                else {
                    return status;
                }
            }));
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }


    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    className="grow"
                    value={statusInput}
                    onChange={(event) => { setStatusInput(event.target.value); }}
                    placeholder="Status"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <StatusesList statuses={statuses} removeStatus={removeStatus} toggleStatus={toggleStatus} />
        </div>
    );
}
