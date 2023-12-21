import DeleteButton from "./DeleteButton";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";



type RemoveListItemData = {
    contents: React.ReactNode,
    buttonTitle?: string | undefined,
    onButtonClick: () => void
}

type RemoveListProps<T> = {
    data: T[],
    computeItemKey: (index: number, item: T) => React.Key,
    itemContent: (index: number, item: T) => RemoveListItemData
}

export default function RemoveList<T>(props: RemoveListProps<T>) {
    return (
        <Virtuoso
            data={props.data}
            computeItemKey={props.computeItemKey}
            itemContent={(index, item) => {
                const itemData = props.itemContent(index, item);

                return (
                    <div className={clsx("flex", { "bg-neutral-100": index % 2 })}>
                        {itemData.contents}
                        <DeleteButton
                            title={itemData.buttonTitle}
                            onClick={itemData.onButtonClick}
                        />
                    </div>
                );
            }}
        />
    );
}
