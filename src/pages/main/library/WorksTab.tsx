import * as api from "../../../data/api";
import { useCallback, useEffect, useState } from "react";
import Input from "../../../components/Input";
import { type TableProps, TableVirtuoso } from "react-virtuoso";
import type { Work } from "../../../data/api";
import { formatDistanceToNowStrict } from "date-fns";
import { useWorks } from "../../../hooks/hooks";



function WorksTable({works}: {works: Work[]}) {
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
                data={works}
                computeItemKey={(_, work) => work.id }
                fixedHeaderContent={() => (
                    <tr className="border-[1px] bg-gray-300 border-black">
                        <th className="border-[1px] border-black"></th>
                        <th className="border-[1px] border-black">Name</th>
                        <th className="border-[1px] border-black">Progress</th>
                        <th className="border-[1px] border-black">Updated</th>
                        <th className="border-[1px] border-black">Added</th>
                    </tr>
                )}
                itemContent={(index, work) => (
                    <>
                        <td className="w-[1%] p-[5px] border-[1px] border-black">{index + 1}.</td>
                        <td title={work.name} className="max-w-0 p-[5px] border-[1px] border-black overflow-hidden whitespace-nowrap overflow-ellipsis">{work.name}</td>
                        <td className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.progress}</td>
                        <td title={formatDistanceToNowStrict(Date.parse(work.updated), { addSuffix: true })} className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.updated}</td>
                        <td title={formatDistanceToNowStrict(Date.parse(work.added), { addSuffix: true })} className="w-[1%] p-[5px] border-[1px] border-black whitespace-nowrap">{work.added}</td>
                    </>
                )}
            />
        </div>
    );
}


export default function WorksTab() {
    const { works, setWorks, getWorks } = useWorks();
    
    return (
        <div className="grow flex flex-col gap-y-[10px]">
            <div className="flex flex-col">
                <Input placeholder="Find" />
                <select id="works-by-select">
                    <option value="name">Name</option>
                    <option value="progress">Progress</option>
                </select>
                <fieldset>
                    <legend>Statuses</legend>
                </fieldset>
                <fieldset>
                    <legend>Types</legend>
                </fieldset>
                <fieldset>
                    <legend>Formats</legend>
                </fieldset>
            </div>
            <WorksTable works={works} />
        </div>
    );
}
