import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { type Status, addStatus, getStatuses as apiGetStatuses, removeStatus as apiRemoveStatus, updateStatus } from "../../api";
import Button from "../../utility/Button";



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
            <button onClick={() => { removeStatus(status.id); }}>REMOVE</button>
        </div>
    ));

    return <div>{statusesItems}</div>;
}


function useStatuses() {
    const [statuses, setStatuses] = useState<Status[]>([]);
  
    const getStatuses = () => {
        apiGetStatuses().then((value) => {
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

        addStatus(statusInput).then(() => {
            getStatuses();
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function removeStatus(id: number) {
        apiRemoveStatus(id).then(() => {
            getStatuses();
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }

    function toggleStatus(id: number, isUpdate: boolean) {
        updateStatus(id, isUpdate).then(() => {
            getStatuses();
        }).catch((reason) => {
            getStatuses();
            alert(reason);
        });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="status-input">Status:</label>
                <input
                    id="status-input"
                    value={statusInput}
                    onInput={(event: ChangeEvent<HTMLInputElement>) => { setStatusInput(event.target.value); }}
                />
                <Button>Add</Button>
            </form>
            <StatusesList statuses={statuses} removeStatus={removeStatus} toggleStatus={toggleStatus} />
        </>
    );
}
