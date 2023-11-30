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
        <div key={format.id}>
            <p>{format.format}</p>
            <DeleteButton
                onClick={() => { removeFormat(format.id); } }
                title={`Remove format "${format.format}".`}
            />
        </div>
    ));

    return <div>{formatsItems}</div>;
}




export default function TypesTab() {
    const { formats, getFormats } = useFormats();
    const [formatInput, setFormatInput] = useState("");


    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        api.addFormat(formatInput)
            .then(() => { setFormatInput(""); })
            .catch((reason) => { alert(reason); })
            .finally(() => { getFormats(); });
    }

    function removeFormat(id: number) {
        api.removeFormat(id)
            .then(() => {
                sessionStorage.removeItem(StorageKey.LibraryWorksFilter);
                sessionStorage.removeItem(StorageKey.AddWorkFormData);
            })
            .catch((reason) => { alert(reason); })
            .finally(() => { getFormats(); });
    }


    return (
        <>
            <form onSubmit={handleSubmit}>
                <Input
                    value={formatInput}
                    onChange={(event) => { setFormatInput(event.target.value); }}
                    placeholder="Format"
                    required={true}
                />
                <Button>Add</Button>
            </form>
            <FormatsList formats={formats} removeFormat={removeFormat} />
        </>
    );
}
