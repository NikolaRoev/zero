import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    SortableContext,
    //arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { forwardRef, useState } from "react";
import { BsGripVertical } from "react-icons/bs";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";



type ItemProps = {
    children: React.ReactNode,
    classNameContainer?: string,
    classNameHandle?: string,
    style?: React.CSSProperties | undefined
}

export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item({children, classNameContainer, classNameHandle, style, ...props}, ref) {
    return (
        <div ref={ref} className={clsx("flex grow", classNameContainer)} style={style}>
            <button {...props} className={clsx("rounded", classNameHandle)}><BsGripVertical /></button>
            {children}
        </div>
    );
});



type SortableItemProps = {
    children: React.ReactNode,
    id: number,
    className?: string,
}

export function SortableItem(props: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: props.id});
  
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };
  
    return (
        <Item
            ref={setNodeRef}
            style={style}
            classNameContainer={clsx({"opacity-50": isDragging}, props.className)}
            classNameHandle={clsx("hover:bg-neutral-300 rounded")}
            {...attributes}
            {...listeners}
        >{props.children}</Item>
    );
}



type SortableListProps<T extends { id: number }> = {
    data: T[],
    onDragEnd: (event: DragEndEvent)=> void,
    itemContent: (index: number, item: T) => React.ReactElement<SortableItemProps>,
    generateDragContent: (id: number) => React.ReactNode
}

export function SortableList<T extends { id: number }>(props: SortableListProps<T>) {
    const [activeId, setActiveId] = useState<number | null>(null);

    
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );


    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => { setActiveId(event.active.id as number); }}
            onDragEnd={(event) => { props.onDragEnd(event); setActiveId(null); }}
        >
            <SortableContext
                items={props.data}
                strategy={verticalListSortingStrategy}
            >
                <div className="h-full relative overflow-y-auto border border-neutral-700 rounded">
                    <div className="w-full h-full absolute top-0">
                        <div className="">
                            {props.data.map((item, index) => props.itemContent(index, item))}
                        </div>
                    </div>
                </div>
            </SortableContext>
            <DragOverlay>
                {activeId ? <Item classNameHandle={clsx("bg-neutral-400")}>{props.generateDragContent(activeId)}</Item> : null}
            </DragOverlay>
        </DndContext>
    );
}
