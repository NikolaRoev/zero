import * as api from "../../../api";
import { useCallback, useEffect, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import type { Work } from "../../../api";



function useWorks() {
    //const [filter, setFilter] = useState("");
    const [works, setWorks] = useState<Work[]>([]);
  
    const getWorks = useCallback(() => {
        api.getWorks().then((value) => {
            setWorks(value);
        }).catch((reason) => { alert(reason); });
    }, []);

    useEffect(() => {
        getWorks();
    }, [/*filter, */getWorks]);

    return { /*filter, setFilter, */works, setWorks, getWorks };
}

export default function LibraryTab() {
    const  {works, setWorks, getWorks} = useWorks();

    return (
        <div className="grow overflow-hidden flex flex-col">
            <TableVirtuoso
                components={{
                    Table: ({ style, ...props }) => <table {...props} style={{ ...style, width: "100%" }} /> }}
                data={works}
                computeItemKey={(_, work) => work.id }
                fixedHeaderContent={() => (
                    <tr>
                        <th className="text-lg" >ID</th>
                        <th>Name</th>
                        <th>Updated</th>
                        <th>Added</th>
                    </tr>
                )}
                itemContent={(_, work) => (
                    <>
                        <td>{work.id}</td>
                        <td>{work.name}</td>
                        <td>{work.updated}</td>
                        <td>{work.added}</td>
                    </>
                )}
            />
        </div>
    );
}
