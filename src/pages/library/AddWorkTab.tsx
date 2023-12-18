import type { Creator, Work } from "../../data/api";
import AddCreatorsList from "../../components/AddCreatorsList";
import Button from "../../components/Button";
import CreatorsTable from "../../components/CreatorsTable";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import Select from "../../components/Select";
import { StorageKey } from "../../data/storage";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer";



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
    { action: "ChangeFormat", formatIndex: number } |
    { action: "AddCreator", id: number } |
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
            if (!addWorkFormData.creators.find((id) => id === action.id)) {
                return { ...addWorkFormData, creators: [...addWorkFormData.creators, action.id] };
            }
            return addWorkFormData;
        }
        case "RemoveCreator": {
            return { ...addWorkFormData, creators: addWorkFormData.creators.filter((id) => id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}


export default function AddWorkTab() {
    const { creators, statuses, types, formats, addWork } = useSafeContext(DataContext);
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [addWorkFormData, addWorkFormDispatch] = useSessionReducer(StorageKey.AddWorkFormData, addWorkFormReducer, emptyAddWorkFormData);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const status = statuses[addWorkFormData.statusIndex]?.status;
        const type = types[addWorkFormData.typeIndex]?.type;
        const format = formats[addWorkFormData.formatIndex]?.format;

        if (status && type && format) {
            const timestamp = Date.now();
            const work: Work = {
                id: 0,
                name: addWorkFormData.name,
                progress: addWorkFormData.progress,
                status: status,
                type: type,
                format: format,
                updated: timestamp,
                added: timestamp,
                creators: addWorkFormData.creators
            };

            addWork(work, (id) => {
                toast(<div
                    onClick={() => { navigationDispatch({ action: "New", page: { type: "Work", id: id}}); }}
                >{`Added work "${addWorkFormData.name}".`}</div>);
                addWorkFormDispatch({ action: "Clear" });
            });
        }
    }


    const workCreators: Creator[] = [];
    for (const creatorId of addWorkFormData.creators) {
        const creator = creators.get(creatorId);
        if (creator) {
            workCreators.push(creator);
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
                            onClick={() => { addWorkFormDispatch({ action: "Clear" }); }}
                        >Clear</Button>
                    </div>
                    <label>Name:</label>
                    <Input
                        className="col-span-8"
                        value={addWorkFormData.name}
                        onChange={(event) => { addWorkFormDispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                    <label>Progress:</label>
                    <Input
                        className="col-span-8"
                        value={addWorkFormData.progress}
                        onChange={(event) => { addWorkFormDispatch({ action: "ChangeProgress", progress: event.target.value }); }}
                        placeholder="Progress"
                        required={true}
                    />
                    <label>Status:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.statusIndex}
                        items={statuses.map((status, index) => ({ label: status.status, value: index }))}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeStatus", statusIndex: value}); }}
                        selectMsg="Select Status"
                        errorMsg="No Statuses"
                    />
                    <label>Type:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.typeIndex}
                        items={types.map((type, index) => ({ label: type.type, value: index }))}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeType", typeIndex: value}); }}
                        selectMsg="Select Type"
                        errorMsg="No Types"
                    />
                    <label>Format:</label>
                    <Select
                        className="col-span-2"
                        value={addWorkFormData.formatIndex}
                        items={formats.map((format, index) => ({ label: format.format, value: index }))}
                        onChange={(value) => { addWorkFormDispatch({ action: "ChangeFormat", formatIndex: value}); }}
                        selectMsg="Select Format"
                        errorMsg="No Formats"
                    />
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <label className="p-[5px] border-b border-neutral-700 ">Creators:</label>
                        <CreatorsTable
                            creators={workCreators}
                            storageKey={StorageKey.AddWorkCreatorsSort}
                            name
                            works
                            onDetachCreator={(id) => { addWorkFormDispatch({ action: "RemoveCreator", id: id }); } }
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddCreatorsList
                            workCreators={workCreators}
                            storageKey={StorageKey.AddWorkCreatorsFilter}
                            onButtonClick={(creatorId) => { addWorkFormDispatch({ action: "AddCreator", id: creatorId }); }}
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
