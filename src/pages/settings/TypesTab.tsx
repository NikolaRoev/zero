import * as api from "../../data/api";
import { type FormEvent, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage-key";
import type { Type } from "../../data/api";
import useTypes from "../../hooks/types";



type TypesListProps = {
    types: Type[],
    removeType: (id: number) => void,
}
function TypesList({ types, removeType }: TypesListProps) {
    const typesItems = types.map((type) => (
        <div key={type.id}>
            <p>{type.type}</p>
            <DeleteButton
                onClick={() => { removeType(type.id); } }
                title={`Remove type "${type.type}".`}
            />
        </div>
    ));

    return <div>{typesItems}</div>;
}


export default function TypesTab() {
    const { types, getTypes } = useTypes();
    const [typeInput, setTypeInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addType(typeInput)
            .then(() => { setTypeInput(""); })
            .catch((reason) => { alert(reason); })
            .finally(() => { getTypes(); });
    }

    function removeType(id: number) {
        api.removeType(id)
            .then(() => {
                sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
                sessionStorage.removeItem(StorageKey.AddWorkFormData);
            })
            .catch((reason) => { alert(reason); })
            .finally(() => { getTypes(); });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <Input
                    value={typeInput}
                    onChange={(event) => { setTypeInput(event.target.value); }}
                    placeholder="Type"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <TypesList types={types} removeType={removeType} />
        </>
    );
}
