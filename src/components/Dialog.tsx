import { useEffect, useRef } from "react";
import { BsX } from "react-icons/bs";
import clsx from "clsx";



type DialogProps = {
    children: React.ReactNode,
    className?: string,
    isOpen: boolean,
    onClose: () => void
}

export default function Dialog({ children, className, isOpen, onClose }: DialogProps) {
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
        >
            <div className={clsx("flex flex-col border border-neutral-700 rounded", className)}>
                <div className="border-b border-neutral-700">
                    <button
                        className={clsx(
                            "ml-auto w-[24px] h-[24px]",
                            "flex justify-center items-center",
                            "hover:bg-neutral-200 active:bg-neutral-300 rounded"
                        )}
                        onClick={() => { onClose(); }}
                    ><BsX /></button>
                </div>
                {children}
            </div>
        </dialog>
    );
}
