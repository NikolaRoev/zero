import * as api from "../../data/api";
import AddWorksList from "../../components/AddWorksList";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { NavigationContext } from "../../contexts/navigation-context";
import { StorageKey } from "../../data/storage";
import type { Work } from "../../data/api";
import WorksTable from "../../components/WorksTable";
import { toast } from "react-toastify";
import useSafeContext from "../../hooks/safe-context-hook";
import useSessionReducer from "../../hooks/session-reducer";



type AddCreatorFormData = {
    name: string,
    works: Work[]
}

const emptyAddCreatorFormData: AddCreatorFormData = {
    name: "",
    works: []
};

type AddCreatorFormAction =
    { action: "Clear" } |
    { action: "ChangeName", name: string } |
    { action: "AddWork", work: Work } |
    { action: "RemoveWork", id: number }



function addCreatorFormReducer(addCreatorFormData: AddCreatorFormData, action: AddCreatorFormAction): AddCreatorFormData {
    switch (action.action) {
        case "Clear": {
            return emptyAddCreatorFormData;
        }
        case "ChangeName": {
            return { ...addCreatorFormData, name: action.name };
        }
        case "AddWork": {
            if (!addCreatorFormData.works.find((work) => work.id === action.work.id)) {
                return { ...addCreatorFormData, works: [...addCreatorFormData.works, action.work] };
            }
            else {
                return addCreatorFormData;
            }
        }
        case "RemoveWork": {
            return { ...addCreatorFormData, works: addCreatorFormData.works.filter((work) => work.id !== action.id) };
        }
        default: {
            const unreachable: never = action;
            throw new Error(`Invalid action: ${unreachable}`);
        }
    }
}



export default function AddCreatorTab() {
    const { navigationDispatch } = useSafeContext(NavigationContext);
    const [addCreatorFormData, dispatch] = useSessionReducer(StorageKey.AddCreatorFormData, addCreatorFormReducer, emptyAddCreatorFormData);


    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addCreator(addCreatorFormData.name, addCreatorFormData.works.map((work) => work.id))
            .then((id) => {
                toast(<div
                    onClick={() => { navigationDispatch({ action: "New", page: { type: "Creator", id: id}}); }}
                >{`Added creator "${addCreatorFormData.name}".`}</div>);
                dispatch({ action: "Clear" });
            })
            .catch((reason) => { alert(reason); });
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
                        value={addCreatorFormData.name}
                        onChange={(event) => { dispatch({ action: "ChangeName", name: event.target.value }); }}
                        placeholder="Name"
                        required={true}
                    />
                </div>
                <div className="grow grid grid-cols-2 gap-x-[10px]">
                    <div className="flex flex-col border border-neutral-700 rounded overflow-y-auto">
                        <label className="p-[5px] border-b border-neutral-700 ">Works:</label>
                        <WorksTable
                            works={addCreatorFormData.works}
                            storageKey={StorageKey.AddCreatorWorksSort}
                            headerClassName="text-sm"
                            dataClassName="text-xs"
                            name
                            progress
                            status
                            type
                            format
                            updated
                            added
                            onDetachWork={(id) => { dispatch({ action: "RemoveWork", id: id }); } }
                        />
                    </div>
                    <div className="p-[5px] gap-y-[5px] grow flex flex-col border border-neutral-700 rounded">
                        <AddWorksList
                            creatorWorks={addCreatorFormData.works}
                            storageKey={StorageKey.AddCreatorWorksFilter}
                            onButtonClick={(work) => { dispatch({ action: "AddWork", work: work }); }}
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
