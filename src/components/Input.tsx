import React, { forwardRef } from "react";
import clsx from "clsx";



interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
    className?: string | undefined
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
    return (
        <input
            ref={ref}
            className={clsx(
                "px-[7px] py-[2px] border border-neutral-700 rounded overflow-ellipsis",
                "focus:outline-none focus:shadow-[inset_0px_-2px_2px_-2px_#404040]",
                className
            )}
            spellCheck={false}
            autoComplete="false"
            aria-autocomplete="none"
            {...props}
        />
    );
});

export default Input;
