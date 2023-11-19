import * as api from "../../api";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Button from "../../utility/Button";
import DeleteButton from "../../utility/ConfirmButton";
import type { Type } from "../../api";



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


function useTypes() {
    const [types, setTypes] = useState<Type[]>([]);
  
    const getTypes = () => {
        api.getTypes().then((value) => {
            setTypes(value);
        }).catch((reason) => { alert(reason); });
    };

    useEffect(() => {
        getTypes();
    }, []);
  
    return { types, getTypes };
}

export default function TypesTab() {
    const { types, getTypes } = useTypes();
    const [typeInput, setTypeInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addType(typeInput).then(() => {
            setTypeInput("");
            getTypes();
        }).catch((reason) => {
            getTypes();
            alert(reason);
        });
    }

    function removeType(id: number) {
        api.removeType(id).then(() => {
            getTypes();
        }).catch((reason) => {
            getTypes();
            alert(reason);
        });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Type"
                    value={typeInput}
                    onInput={(event: ChangeEvent<HTMLInputElement>) => { setTypeInput(event.target.value); }}
                />
                <Button>Add</Button>
            </form>
            <TypesList types={types} removeType={removeType} />
        </>
    );
}
