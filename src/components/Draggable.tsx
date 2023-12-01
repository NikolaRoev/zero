import React from "react";
import {useDraggable} from "@dnd-kit/core";



type DraggableProps<T> = {
    children?: React.ReactNode,
    id: number,
    value: T,
    onClick: () => void
}

export default function Draggable<T>({ children, id, value, onClick }: DraggableProps<T>) {
    const {attributes, listeners, setNodeRef } = useDraggable({
        id: id,
        data: {
            value: value
        }
    });

    return (
        <div
            ref={setNodeRef} {...listeners} {...attributes}
            onClick={onClick}
            className="h-5 w-20"
        >{children}</div>
    );
}
