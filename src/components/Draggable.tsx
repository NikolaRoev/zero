import React from "react";
import {useDraggable} from "@dnd-kit/core";



type DraggableProps<T> = {
    children?: React.ReactNode,
    id: number,
    value: T
}

export default function Draggable<T>({ children, id, value }: DraggableProps<T>) {
    const {attributes, listeners, setNodeRef } = useDraggable({
        id: id,
        data: {
            value: value
        }
    });

    return (
        <div
            ref={setNodeRef} {...listeners} {...attributes}
            className="h-5 w-20"
        >{children}</div>
    );
}
