import * as api from "../../data/api";
import Input from "../../components/Input";
import { useCreator } from "../../hooks/creators";


export default function CreatorPage({ id }: { id: number }) {
    const { creator, setCreator, getCreator, creatorWorks, getCreatorWorks } = useCreator(id);

    
    function handleNameChange(id: number, value: string) {
        setCreator({...creator, name: value });
        api.updateCreatorName(id, value).catch((reason) => {
            getCreator();
            alert(reason);
        });
    }


    return (
        <div>
            <label>ID: {creator.id}</label>
            <Input
                value={creator.name}
                placeholder="Name"
                onChange={(event) => { handleNameChange(creator.id, event.target.value); }}
            />
        </div>
    );
}
