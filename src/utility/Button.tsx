import type { ReactElement } from "react";



type ButtonProps = {
    children: ReactElement | ReactElement[] | string,
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
