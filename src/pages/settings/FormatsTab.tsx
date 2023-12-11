import * as api from "../../data/api";
import { type FormEvent, useState } from "react";
import Button from "../../components/Button";
import DeleteButton from "../../components/DeleteButton";
import type { Format } from "../../data/api";
import Input from "../../components/Input";
import { StorageKey } from "../../data/storage";
import useFormats from "../../hooks/formats";



type FormatsListProps = {
    formats: Format[],
    removeFormat: (id: number) => void,
}
function FormatsList({ formats, removeFormat }: FormatsListProps) {
    const formatsItems = formats.map((format) => (
        <div key={format.id} className="flex even:bg-neutral-200">
            <p className="grow p-[5px]">{format.format}</p>
            <DeleteButton
                onClick={() => { removeFormat(format.id); } }
                title={`Remove format "${format.format}".`}
            />
        </div>
    ));

    return <div className="grow border border-neutral-700 rounded-[5px] overflow-y-auto">{formatsItems}</div>;
}



export default function TypesTab() {
    const { formats, setFormats, getFormats } = useFormats();
    const [formatInput, setFormatInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addFormat(formatInput).then((id) => {
            setFormats([...formats, { id: id, format: formatInput }]);
            setFormatInput("");
        }).catch((reason) => {
            getFormats();
            alert(reason);
        });
    }

    function removeFormat(id: number) {
        api.removeFormat(id).then(() => {
            setFormats(formats.filter((format) => format.id !== id));
            sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
            sessionStorage.removeItem(StorageKey.AddWorkFormData);
        }).catch((reason) => {
            getFormats();
            alert(reason);
        });
    }


    return (
        <div className="p-[5px] grow flex flex-col gap-y-[10px]">
            <form onSubmit={handleSubmit} className="flex gap-x-[3px]">
                <Input
                    className="grow"
                    value={formatInput}
                    onChange={(event) => { setFormatInput(event.target.value); }}
                    placeholder="Format"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <FormatsList formats={formats} removeFormat={removeFormat} />
        </div>
    );
}
