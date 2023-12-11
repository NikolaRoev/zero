import { BsX, BsXCircle } from "react-icons/bs";
import clsx from "clsx";
import { useState } from "react";



type DeleteButtonProps = {
    onClick: () => void,
    title: string,
    className?: string,
}

export default function DeleteButton({ onClick, title, className }: DeleteButtonProps) {
    const [triggered, setTriggered] = useState(false);


    function handleClick() {
        if (!triggered) {
            setTriggered(true);

            setTimeout(() => {
                setTriggered(false);
            }, 1500);
        }
        else {
            onClick();
        }
    }


    return (
        <button
            className={clsx(
                "min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-neutral-300 active:bg-neutral-400",
                className
            )}
            onClick={handleClick}
            title={title}
            type="button"
        >{triggered ? <BsXCircle /> : <BsX />}</button>
    );
}
