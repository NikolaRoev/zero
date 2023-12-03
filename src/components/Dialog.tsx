import { useEffect, useRef } from "react";
import Button from "./Button";

type DialogProps = {
    children: React.ReactNode,
    isOpen: boolean,
    onClose: () => void
}

export default function Dialog({ children, isOpen, onClose }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);


    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        }
        else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickEvent = (event: MouseEvent) => {
            if (dialogRef.current === event.target) {
                onClose();
            }
        };

        window.addEventListener("click", handleClickEvent);
        
        return () => {
            window.removeEventListener("click", handleClickEvent);
        };
    }, [onClose]);


    return (
        <dialog
            ref={dialogRef}
            onKeyDown={(event) => { if (event.key === "Escape") { onClose(); } }}
        >
            <div className="w-[500px] h-[500px] flex flex-col p-[10px]">
                <Button className="ml-auto" onClick={() => { onClose(); }}>Close</Button>
                {children}
            </div>
        </dialog>
    );
}
