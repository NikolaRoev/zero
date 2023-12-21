import { type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import RemoveList from "../../components/RemoveList";
import useSafeContext from "../../hooks/safe-context-hook";



function TypesList() {
    const { types, removeType } = useSafeContext(DataContext);

    return (
        <div className="grow border border-neutral-700 rounded-[5px]">
            <RemoveList
                data={types}
                computeItemKey={(_, type) => type.id }
                itemContent={(_, type) => ({
                    contents: <p className="grow p-[5px]">{type.type}</p>,
                    buttonTitle: `Remove format "${type.type}".`,
                    onButtonClick: () => { removeType(type.id); }
                })}
            />
        </div>
    );
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
