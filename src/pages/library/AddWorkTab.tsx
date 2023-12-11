import * as api from "../../data/api";
import AddCreatorsList from "../../components/AddCreatorsList";
import Button from "../../components/Button";
import type { Creator } from "../../data/api";
import CreatorsTable from "../../components/CreatorsTable";
import Input from "../../components/Input";
import Select from "../../components/Select";
import { StorageKey } from "../../data/storage";
import useFormats from "../../hooks/formats";
import useSessionReducer from "../../hooks/session-reducer";
import { useStatuses } from "../../hooks/statuses";
import useTypes from "../../hooks/types";



type AddWorkFormData = {
    name: string,
    progress: string,
    statusIndex: number,
    typeIndex: number,
    formatIndex: number,
    creators: Creator[]
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
    { action: "ChangeFormat", formatIndex: number } |
    { action: "AddCreator", creator: Creator } |
    { action: "RemoveCreator", id: number }



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
        case "AddCreator": {
            if (!addWorkFormData.creators.find((creator) => creator.id === action.creator.id)) {
                return { ...addWorkFormData, creators: [...addWorkFormData.creators, action.creator] };
            }
            else {
                return addWorkFormData;
            }
        }
        case "RemoveCreator": {
            return { ...addWorkFormData, creators: addWorkFormData.creators.filter((creator) => creator.id !== action.id) };
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
    const [addWorkFormData, dispatch] = useSessionReducer(StorageKey.AddWorkFormData, addWorkFormReducer, emptyAddWorkFormData);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const status = statuses[addWorkFormData.statusIndex]?.status;
        const type = types[addWorkFormData.typeIndex]?.type;
        const format = formats[addWorkFormData.formatIndex]?.format;

        if (status && type && format) {
            api.addWork(addWorkFormData.name, addWorkFormData.progress, status, type, format, addWorkFormData.creators.map((creator) => creator.id))
                .then(() => { dispatch({ action: "Clear" }); })
                .catch((reason) => { alert(reason); });
        }
    }


    return (
        <div className="p-[5px] grow flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col grow gap-y-[10px]">
                <div className="p-[5px] grid grid-cols-9 gap-x-[40px] gap-y-[5px] border border-neutral-700 rounded">
                    <div className="col-span-9 flex rounded">
                        <Button
                            className="ml-auto"
                            type="button"
                            onClick={() => { dispatch({ action: "Clear" }); }}
                        >Clear</Button>
                    </div>
                    <label>Name:</label>
                    <Input
                        className="col-span-8"
                        value={addWorkFormData.name}
                        onChange={(event) => { dispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                    <label>Progress:</label>
                    <Input
                        className="col-span-8"
                        value={addWorkFormData.progress}
                        onChange={(event) => { dispatch({ action: "ChangeProgress", progress: event.target.value }); }}
                        placeholder="Progress"
                        required={true}
                    />
                    <label>Status:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.statusIndex}
                        items={statuses.map((status, index) => ({ label: status.status, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeStatus", statusIndex: value}); }}
                        selectMsg="Select Status"
                        errorMsg="No Statuses"
                    />
                    <label>Type:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.typeIndex}
                        items={types.map((type, index) => ({ label: type.type, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeType", typeIndex: value}); }}
                        selectMsg="Select Type"
                        errorMsg="No Types"
                    />
                    <label>Format:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.formatIndex}
                        items={formats.map((format, index) => ({ label: format.format, value: index }))}
                        onChange={(value) => { dispatch({ action: "ChangeFormat", formatIndex: value}); }}
                        selectMsg="Select Format"
                        errorMsg="No Formats"
                    />
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <label className="p-[5px] border-b border-neutral-700 ">Creators:</label>
                        <CreatorsTable
                            creators={addWorkFormData.creators}
                            storageKey={StorageKey.AddWorkCreatorsSort}
                            name
                            works
                            onDetachCreator={(id) => { dispatch({ action: "RemoveCreator", id: id }); } }
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddCreatorsList
                            workCreators={addWorkFormData.creators}
                            storageKey={StorageKey.AddWorkCreatorsFilter}
                            onButtonClick={(creator) => { dispatch({ action: "AddCreator", creator: creator }); }}
                        />
                    </div>
                </div>
                <div className="pb-[5px] col-span-9">
                    <Button className="w-[100px]">Add</Button>
                </div>
            </form>
        </div>
    );
}
