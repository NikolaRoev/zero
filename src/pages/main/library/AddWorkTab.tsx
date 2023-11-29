import * as api from "../../../data/api";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import { StorageKey } from "../../../data/storage-key";
import { useCreators } from "../../../hooks/creators";
import useFormats from "../../../hooks/formats";
import useSessionReducer from "../../../hooks/session-reducer";
import useSessionState from "../../../hooks/session-state";
import { useStatuses } from "../../../hooks/statuses";
import useTypes from "../../../hooks/types";
import { DndContext } from "@dnd-kit/core";



type AddWorkFormData = {
    name: string,
    progress: string,
    statusIndex: number,
    typeIndex: number,
    formatIndex: number,
    creators: number[]
}

const emptyAddWorkFormData: AddWorkFormData = {
    name: "",
    progress: "",
    statusIndex: 0,
    typeIndex: 0,
    formatIndex: 0,
    creators: []
};

type AddWorkFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "ChangeProgress", progress: string } |
    { action: "ChangeStatus", statusIndex: number } |
    { action: "ChangeType", typeIndex: number } |
    { action: "ChangeFormat", formatIndex: number }



function addWorkFormReducer(addWorkFormData: AddWorkFormData, action: AddWorkFormAction): AddWorkFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddWorkFormData;
        }
        case "ChangeName": {
            return { ...addWorkFormData, name: action.name };
        }
        case "ChangeProgress": {
            return { ...addWorkFormData, progress: action.progress };
        }
        case "ChangeStatus": {
            return { ...addWorkFormData, statusIndex: action.statusIndex };
        }
        case "ChangeType": {
            return { ...addWorkFormData, typeIndex: action.typeIndex };
        }
        case "ChangeFormat": {
            return { ...addWorkFormData, formatIndex: action.formatIndex };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function AddWorkTab() {
    const { statuses } = useStatuses();
    const { types } = useTypes();
    const { formats } = useFormats();
    const { creators } = useCreators();
    const [creatorsFilter, setCreatorsFilter] = useSessionState(StorageKey.AddWorkCreatorsFilter, "");
    const [addWorkFormData, dispatch] = useSessionReducer(StorageKey.AddWorkFormData, addWorkFormReducer, emptyAddWorkFormData);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const status = statuses[addWorkFormData.statusIndex]?.status;
        const type = types[addWorkFormData.typeIndex]?.type;
        const format = formats[addWorkFormData.formatIndex]?.format;

        if (status && type && format) {
            api.addWork(addWorkFormData.name, addWorkFormData.progress, status, type, format, addWorkFormData.creators)
                .then(() => { dispatch({ action: "Clear" }); })
                .catch((reason) => { alert(reason); });
        }
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <Input
                    value={addWorkFormData.name}
                    onChange={(event) => { dispatch({ action: "ChangeName", name: event.target.value }); }}
                    placeholder="Name"
                    required={true}
                />
                <Input
                    value={addWorkFormData.progress}
                    onChange={(event) => { dispatch({ action: "ChangeProgress", progress: event.target.value }); }}
                    placeholder="Progress"
                    required={true}
                />
                <Select
                    value={addWorkFormData.statusIndex}
                    items={statuses.map((status, index) => ({ label: status.status, value: index }))}
                    onChange={(value) => { dispatch({ action: "ChangeStatus", statusIndex: value}); }}
                    selectMsg="Select Status"
                    errorMsg="No Statuses"
                />
                <Select
                    value={addWorkFormData.typeIndex}
                    items={types.map((type, index) => ({ label: type.type, value: index }))}
                    onChange={(value) => { dispatch({ action: "ChangeType", typeIndex: value}); }}
                    selectMsg="Select Type"
                    errorMsg="No Types"
                />
                <Select
                    value={addWorkFormData.formatIndex}
                    items={formats.map((format, index) => ({ label: format.format, value: index }))}
                    onChange={(value) => { dispatch({ action: "ChangeFormat", formatIndex: value}); }}
                    selectMsg="Select Format"
                    errorMsg="No Formats"
                />
                <Button>Add</Button>
            </form>
            <Button onClick={() => { dispatch({ action: "Clear" }); }}>Clear</Button>
        </>
    );
}
