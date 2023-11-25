import * as api from "../../data/api";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import type { Status } from "../../data/api";
import { emit } from "@tauri-apps/api/event";



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


function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);
  
    const getStatuses = () => {
        api.getStatuses().then((value) => {
            setStatuses(value);
        }).catch((reason) => { alert(reason); });
    };

    useEffect(() => {
        getStatuses();
    }, []);
  
    return { statuses, getStatuses };
}

export default function StatusesTab() {
    const { statuses, getStatuses } = useStatuses();
    const [statusInput, setStatusInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addStatus(statusInput).then(async () => {
            setStatusInput("");
            getStatuses();
            await emit(api.ADDED_STATUS_EVENT);
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function removeStatus(id: number) {
        api.removeStatus(id).then(() => {
            getStatuses();
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function toggleStatus(id: number, isUpdate: boolean) {
        api.updateStatus(id, isUpdate).then(async () => {
            getStatuses();
            await emit(api.REFRESH_WORKS_EVENT);
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <Input
                    value={statusInput}
                    onInput={(event: ChangeEvent<HTMLInputElement>) => { setStatusInput(event.target.value); }}
                    placeholder="Status"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <StatusesList statuses={statuses} removeStatus={removeStatus} toggleStatus={toggleStatus} />
        </>
    );
}
