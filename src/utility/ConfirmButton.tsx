import { useState } from "react";



type ConfirmButtonProps = {
    initialSrc: string,
    confirmSrc: string,
    onClick: () => void,
    title: string
}

export default function ConfirmButton({ initialSrc, confirmSrc, onClick, title }: ConfirmButtonProps) {
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
        ><img src={triggered ? confirmSrc  : initialSrc} /></button>
    );
}
