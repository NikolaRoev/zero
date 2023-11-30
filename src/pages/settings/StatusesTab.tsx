import * as api from "../../data/api";
import { type ChangeEvent, type FormEvent, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import type { Status } from "../../data/api";
import { StorageKey } from "../../data/storage";
import { useStatuses } from "../../hooks/statuses";



type StatusesListProps = {
    statuses: Status[],
    removeStatus: (id: number) => void,
    toggleStatus: (id: number, isUpdate: boolean) => void,
}
function StatusesList({ statuses, removeStatus, toggleStatus }: StatusesListProps) {
    const statusesItems = statuses.map((status) => (
        <div key={status.id}>
            <p>{status.status}</p>
            <input
                type="checkbox"
                checked={status.is_update}
                onChange={(event: ChangeEvent<HTMLInputElement>) => { toggleStatus(status.id, event.target.checked); }}
            />
            <DeleteButton
                onClick={() => { removeStatus(status.id); } }
                title={`Remove status "${status.status}".`}
            />
        </div>
    ));

    return <div>{statusesItems}</div>;
}


export default function StatusesTab() {
    const { statuses, getStatuses } = useStatuses();
    const [statusInput, setStatusInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addStatus(statusInput)
            .then(() => { setStatusInput(""); })
            .catch((reason) => { alert(reason); })
            .finally(() => { getStatuses(); });
    }

    function removeStatus(id: number) {
        api.removeStatus(id)
            .then(() => {
                sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
                sessionStorage.removeItem(StorageKey.AddWorkFormData);
            })
            .catch((reason) => { alert(reason); })
            .finally(() => { getStatuses(); });
    }

    function toggleStatus(id: number, isUpdate: boolean) {
        api.updateStatus(id, isUpdate)
            .catch((reason) => { alert(reason); })
            .finally(() => { getStatuses(); });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <Input
                    value={statusInput}
                    onChange={(event) => { setStatusInput(event.target.value); }}
                    placeholder="Status"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <StatusesList statuses={statuses} removeStatus={removeStatus} toggleStatus={toggleStatus} />
        </>
    );
}
