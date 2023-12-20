import { type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import useSafeContext from "../../hooks/safe-context-hook";



function TypesList() {
    const { types, removeType } = useSafeContext(DataContext);

    const typesItems = types.map((type) => (
        <div key={type.id} className="flex even:bg-neutral-100">
            <p className="grow p-[5px]">{type.type}</p>
            <DeleteButton
                onClick={() => { removeType(type.id); }}
                title={`Remove type "${type.type}".`}
            />
        </div>
    ));

    return <div className="grow border border-neutral-700 rounded-[5px] overflow-y-auto">{typesItems}</div>;
}


export default function TypesTab() {
    const { addType } = useSafeContext(DataContext);
    const [typeInput, setTypeInput] = useState("");
    const typeInputRef = useRef<HTMLInputElement>(null);


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addType(typeInput, () => {
            setTypeInput("");
            if (typeInputRef.current?.value) { typeInputRef.current.value = ""; }
        });
        
    }


    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={typeInputRef}
                    className="grow"
                    value={typeInput}
                    onChange={(event) => { setTypeInput(event.target.value); }}
                    placeholder="Type"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <TypesList />
        </div>
    );
}
