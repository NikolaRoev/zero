import { useEffect, useRef } from "react";




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
        const handleMousedownEvent = (event: MouseEvent) => {
            if (dialogRef.current === event.target) {
                onClose();
            }
        };

        window.addEventListener("mousedown", handleMousedownEvent);
        
        return () => {
            window.removeEventListener("mousedown", handleMousedownEvent);
        };
    }, [onClose]);


    return (
        <dialog
            ref={dialogRef}
            onKeyDown={(event) => { if (event.key === "Escape") { onClose(); } }}
        >{children}</dialog>
    );
}
