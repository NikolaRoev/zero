import clsx from "clsx";

type ButtonProps = {
    children: React.ReactNode,
    className?: string,
    type?: "submit" | "reset" | "button";
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    title?: string
}

export default function Button({ children, className, onClick, title, type }: ButtonProps) {
    return (
        <button
            className={clsx(
                "px-[5px]",
                "border border-neutral-800 rounded",
                "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300",
                "select-none",
                className
            )}
            type={type}
            onClick={onClick}
            title={title}
        >{children}</button>
    );
}
