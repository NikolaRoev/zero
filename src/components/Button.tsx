import type React from "react";

type ButtonProps = {
    children: React.ReactNode,
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    title?: string
}

export default function Button({ children, onClick, title }: ButtonProps) {
    return (
        <button
            className=""
            onClick={onClick}
            title={title}
        >{children}</button>
    );
}
