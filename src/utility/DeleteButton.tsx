import { useState } from "react";



type DeleteButtonProps = {
    onClick: () => void,
    title: string
}

export default function DeleteButton({ onClick, title }: DeleteButtonProps) {
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
            className="min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-gray active:bg-dark-gray"
            onClick={handleClick}
            title={title}
        ><img src={triggered ? "/icons/x-circle.svg" : "/icons/trash.svg"} /></button>
    );
}
