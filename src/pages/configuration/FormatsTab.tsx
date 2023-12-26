import { type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import Input from "../../components/Input";
import RemoveList from "../../components/RemoveList";
import useSafeContext from "../../hooks/safe-context-hook";



function FormatsList() {
    const { formats, removeFormat } = useSafeContext(DataContext);

    return (
        <div className="grow border border-neutral-700 rounded-[5px]">
            <RemoveList
                data={formats}
                computeItemKey={(_, format) => format.id }
                itemContent={(_, format) => ({
                    contents: <p className="grow p-[5px]">{format.format}</p>,
                    buttonTitle: `Remove format "${format.format}".`,
                    onButtonClick: () => { removeFormat(format.id); }
                })}
            />
        </div>
    );
}


export default function FormatsTab() {
    const { addFormat } = useSafeContext(DataContext);
    const [formatInput, setFormatInput] = useState("");
    const formatInputRef = useRef<HTMLInputElement>(null);


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        addFormat(formatInput, () => {
            setFormatInput("");
            if (formatInputRef.current?.value) { formatInputRef.current.value = ""; }
        });
    }


    return (
        <div className="px-[5px] py-[10px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={formatInputRef}
                    name="format-add-input"
                    className="grow"
                    value={formatInput}
                    onChange={(event) => { setFormatInput(event.target.value); }}
                    placeholder="Format"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <FormatsList />
        </div>
    );
}
