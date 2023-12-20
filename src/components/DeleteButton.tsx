import { BsX, BsXCircle } from "react-icons/bs";
import clsx from "clsx";
import { useState } from "react";



type DeleteButtonProps = {
    className?: string,
    title: string,
    onClick: () => void
}

export default function DeleteButton(props: DeleteButtonProps) {
    const [triggered, setTriggered] = useState(false);


    function handleClick() {
        if (!triggered) {
            setTriggered(true);

            setTimeout(() => {
                setTriggered(false);
            }, 1500);
        }
        else {
            props.onClick();
        }
    }


    return (
        <button
            className={clsx(
                "min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400",
                props.className
            )}
            type="button"
            title={props.title}
            onClick={handleClick}
        >{triggered ? <BsXCircle /> : <BsX />}</button>
    );
}
