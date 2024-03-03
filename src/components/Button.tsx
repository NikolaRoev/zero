import clsx from "clsx";
import { forwardRef } from "react";



interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    children: React.ReactNode,
    className?: string | undefined
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ children, className, ...props }, ref) {
    return (
        <button
            ref={ref}
            className={clsx(
                "px-[5px]",
                "border border-neutral-800 rounded",
                "bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300",
                "select-none",
                className
            )}
            {...props}
        >{children}</button>
    );
});

export default Button;
