import * as api from "../data/api";
import type { Creator, Format, Status, Type, Work } from "../data/api";
import { createContext } from "react";
import { message } from "@tauri-apps/api/dialog";
import { useCreators } from "../hooks/creators";
import useFormats from "../hooks/formats";
import { useStatuses } from "../hooks/statuses";
import useTypes from "../hooks/types";
import { useWorks } from "../hooks/works";



type DataContextContents = {
    works: Map<number, Work>,
    creators: Map<number, Creator>,
    statuses: Status[],
    types: Type[],
    formats: Format[],

    addWork: (work: Work, callback: (id: number) => void) => void,
    addCreator: (creator: Creator, callback: (id: number) => void) => void,
    addStatus: (status: string, callback: () => void) => void,
    addType: (type: string, callback: () => void) => void,
    addFormat: (format: string, callback: () => void) => void,

    removeWork: (id: number, callback: () => void) => void,
    removeCreator: (id: number, callback: () => void) => void,
    removeStatus: (id: number) => void,
    removeType: (id: number) => void,
    removeFormat: (id: number) => void,

    updateStatus: (id: number, isUpdate: boolean) => void,

    updateWorkName: (id: number, name: string) => void,
    updateWorkProgress: (id: number, progress: string) => void,
    updateWorkStatus: (id: number, status: string) => void,
    updateWorkType: (id: number, type: string) => void,
    updateWorkFormat: (id: number, format: string) => void,

    updateCreatorName: (id: number, name: string) => void,

    attach: (workId: number, creatorId: number) => void,
    detach: (workId: number, creatorId: number) => void
}

export const DataContext = createContext<DataContextContents | null>(null);


export default function DataContextProvider({ children }: { children: React.ReactNode }) {
    const works = useWorks();
    const creators = useCreators();
    const { statuses, addStatus, removeStatus, updateStatus } = useStatuses();
    const { types, addType, removeType } = useTypes();
    const { formats, addFormat, removeFormat } = useFormats();


    function addWork(work: Work, callback: (id: number) => void) {
        api.addWork(work).then((workId) => {
            works.addWork({ ...work, id: workId });
            work.creators.map((creatorId) => { creators.attach(workId, creatorId); });
            callback(workId);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to add Work.", type: "error" });
        });
    }

    function addCreator(creator: Creator, callback: (id: number) => void) {
        api.addCreator(creator).then((creatorId) => {
            creators.addCreator({ ...creator, id: creatorId });
            creator.works.map((workId) => { works.attach(workId, creatorId); });
            callback(creatorId);
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to add Creator.", type: "error" });
        });
    }

    function removeWork(id: number, callback: () => void) {
        works.getWork(id).creators.map((creatorId) => { creators.detach(id, creatorId); });
        works.removeWork(id);

        api.removeWork(id).then(() => {
            callback();
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to remove Work.", type: "error" });
        });
    }

    function removeCreator(id: number, callback: () => void) {
        creators.getCreator(id).works.map((workId) => { works.detach(workId, id); });
        creators.removeCreator(id);

        api.removeCreator(id).then(() => {
            callback();
        }).catch(async (reason: string) => {
            await message(reason, { title: "Failed to remove Creator.", type: "error" });
        });
    }

    function attach(workId: number, creatorId: number) {
        works.attach(workId, creatorId);
        creators.attach(workId, creatorId);

        api.attach(workId, creatorId).catch(async (reason: string) => {
            works.getWorks();
            creators.getCreators();
            await message(reason, { title: "Failed to attach.", type: "error" });
        });
    }

    function detach(workId: number, creatorId: number) {
        works.detach(workId, creatorId);
        creators.detach(workId, creatorId);

        api.detach(workId, creatorId).catch(async (reason: string) => {
            works.getWorks();
            creators.getCreators();
            await message(reason, { title: "Failed to detach.", type: "error" });
        });
    }


    return (
        <DataContext.Provider value={{
            works: works.works,
            creators: creators.creators,
            statuses,
            types,
            formats,

            addWork,
            addCreator,
            addStatus,
            addType,
            addFormat,

            removeWork,
            removeCreator,
            removeStatus,
            removeType,
            removeFormat,

            updateStatus,

            updateWorkName: works.updateWorkName,
            updateWorkProgress: works.updateWorkProgress,
            updateWorkStatus: works.updateWorkStatus,
            updateWorkType: works.updateWorkType,
            updateWorkFormat: works.updateWorkFormat,

            updateCreatorName: creators.updateCreatorName,

            attach,
            detach
        }}>
            {children}
        </DataContext.Provider>
    );
}
