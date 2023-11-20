import * as api from "../../../api";
import { useCallback, useEffect, useState } from "react";
import Table, { Column } from "react-virtualized/dist/es/Table";
import type { Work } from "../../../api";
import 'react-virtualized/styles.css';
import AutoSizer from "react-virtualized-auto-sizer";


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
        <div className="grow overflow-hidden">
            <AutoSizer onResizeCapture={() => {console.log(1); }}>
                {({ height, width }) => (
                    <Table
                        width={width}
                        height={height}
                        headerHeight={20}
                        rowHeight={40}
                        rowCount={works.length}
                        rowGetter={({index}) => works[index]}
                        overscanRowCount={20}
                    >
                        <Column label="ID" dataKey="id" width={width * 0.10} />
                        <Column label="Name" dataKey="name" width={width * 0.50} />
                        <Column label="Updated" dataKey="updated" width={width * 0.20} />
                        <Column label="Added" dataKey="added" width={width * 0.20} />
                    </Table>
                )}
            </AutoSizer>
        </div>
    );
}
