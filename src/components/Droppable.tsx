import React from "react";
import clsx from "clsx";
import {useDroppable} from "@dnd-kit/core";



type DroppableProps = {
    children?: React.ReactNode,
    id: string
}

export default function Droppable({ children, id }: DroppableProps) {
    const {isOver, setNodeRef} = useDroppable({ id: id });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "grow flex flex-col border",
                isOver ? "bg-neutral-300" : "bg-neutral-100"
            )}
        >{children}</div>
    );
}
