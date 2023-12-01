import * as api from "../../data/api";
import Input from "../../components/Input";
import { useWork } from "../../hooks/works";


export default function WorkPage({ id }: { id: number }) {
    const { work, setWork, getWork, workCreators, getWorkCreators } = useWork(id);

    
    function handleNameChange(id: number, value: string) {
        setWork({...work, name: value });
        api.updateWorkName(id, value).catch((reason) => {
            getWork();
            alert(reason);
        });
    }


    return (
        <div>
            <label>ID: {work.id}</label>
            <Input
                value={work.name}
                placeholder="Name"
                onChange={(event) => { handleNameChange(work.id, event.target.value); }}
            />
        </div>
    );
}
