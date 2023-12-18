import { type FormEvent, useRef, useState } from "react";
import Button from "../../components/Button";
import { DataContext } from "../../contexts/data-context";
import DeleteButton from "../../components/DeleteButton";
import Input from "../../components/Input";
import useSafeContext from "../../hooks/safe-context-hook";



function FormatsList() {
    const { formats, removeFormat } = useSafeContext(DataContext);

    const formatsItems = formats.map((format) => (
        <div key={format.id} className="flex even:bg-neutral-100">
            <p className="grow p-[5px]">{format.format}</p>
            <DeleteButton
                onClick={() => { removeFormat(format.id); }}
                title={`Remove format "${format.format}".`}
            />
        </div>
    ));

    return <div className="grow border border-neutral-700 rounded-[5px] overflow-y-auto">{formatsItems}</div>;
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
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    ref={formatInputRef}
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
