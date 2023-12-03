import clsx from "clsx";

type ButtonProps = {
    children: React.ReactNode,
    className?: string,
    onClick?: React.MouseEventHandler<HTMLButtonElement>,
    title?: string
}

export default function Button({ children, className, onClick, title }: ButtonProps) {
    return (
        <button
            className={clsx(
                "px-[5px]",
                "border border-neutral-800 rounded",
                "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300",
                "select-none",
                className
            )}
            onClick={onClick}
            title={title}
        >{children}</button>
    );
}
