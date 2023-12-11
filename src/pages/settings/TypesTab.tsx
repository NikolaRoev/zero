import * as api from "../../data/api";
import { type FormEvent, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage";
import type { Type } from "../../data/api";
import useTypes from "../../hooks/types";



type TypesListProps = {
    types: Type[],
    removeType: (id: number) => void,
}
function TypesList({ types, removeType }: TypesListProps) {
    const typesItems = types.map((type) => (
        <div key={type.id} className="flex even:bg-neutral-200">
            <p className="grow p-[5px]">{type.type}</p>
            <DeleteButton
                onClick={() => { removeType(type.id); } }
                title={`Remove type "${type.type}".`}
            />
        </div>
    ));

    return <div className="grow border border-neutral-700 rounded-[5px] overflow-y-auto">{typesItems}</div>;
}


export default function TypesTab() {
    const { types, setTypes, getTypes } = useTypes();
    const [typeInput, setTypeInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addType(typeInput).then((id) => {
            setTypes([...types, { id: id, type: typeInput }]);
            setTypeInput("");
        }).catch((reason) => {
            getTypes();
            alert(reason);
        });
    }

    function removeType(id: number) {
        api.removeType(id).then(() => {
            setTypes(types.filter((type) => type.id !== id));
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch((reason) => {
            getTypes();
            alert(reason);
        });
    }


    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    className="grow"
                    value={typeInput}
                    onChange={(event) => { setTypeInput(event.target.value); }}
                    placeholder="Type"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <TypesList types={types} removeType={removeType} />
        </div>
    );
}
