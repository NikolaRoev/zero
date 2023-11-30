import { type TableProps, TableVirtuoso } from "react-virtuoso";
import type { Creator } from "../../../data/api";
import Input from "../../../components/Input";
import { StorageKey } from "../../../data/storage";
import { useCreators } from "../../../hooks/creators";
import useSessionState from "../../../hooks/session-state";



function CreatorsTable({ creators }: { creators: Creator[]}) {
    return(
        <div className="pl-[10px] grow">
            <TableVirtuoso
                components={{
                    Table: ({ style, ...props } : TableProps) => (
                        <table
                            {...props}
                            style={{ ...style }}
                            className="w-[100%] border-[1px] border-collapse"
                        />
                    )
                }}
                data={creators}
                computeItemKey={(_, creator) => creator.id }
                fixedHeaderContent={() => (
                    <tr className="border-[1px] bg-gray-300 border-black">
                        <th className="border-[1px] border-black"></th>
                        <th className="border-[1px] border-black">Name</th>
                        <th className="border-[1px] border-black">Works</th>
                    </tr>
                )}
                itemContent={(index, creator) => (
                    <>
                        <td className="w-[1%] p-[5px] border-[1px] border-black">{index + 1}.</td>
                        <td title={creator.name} className="max-w-0 p-[5px] border-[1px] border-black overflow-hidden whitespace-nowrap overflow-ellipsis">{creator.name}</td>
                        <td className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{creator.works}</td>
                    </>
                )}
            />
        </div>
    );
}


export default function CreatorsTab() {
    const { creators } = useCreators();
    const [filter, setFilter] = useSessionState(StorageKey.LibraryCreatorsFilter, "");


    const creatorsItems = creators.filter((creator) => {
        if (!creator.name.toLowerCase().includes(filter.toLowerCase())) {
            return false;
        }

        return true;
    });
    
    return (
        <div className="grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <Input
                    value={filter}
                    placeholder="Find"
                    type="search"
                    onChange={(event) => { setFilter(event.target.value); }}
                />
            </div>
            <CreatorsTable creators={creatorsItems} />
        </div>
    );
}
