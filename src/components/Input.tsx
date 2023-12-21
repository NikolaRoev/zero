import clsx from "clsx";
import { forwardRef } from "react";



type InputProps = {
    id?: string,
    className?: string,
    name?: string | undefined,
    value?: string | number | readonly string[],
    onChange?: React.ChangeEventHandler<HTMLInputElement>,
    placeholder?: string,
    type?: string
    required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
    return (
        <input
            id={props.id}
            className={clsx(
                "px-[5px] py-[2px] border border-neutral-700 rounded-[5px] overflow-ellipsis",
                "focus:outline-none focus:shadow-[inset_0px_-2px_2px_-2px_#404040]",
                props.className
            )}
            ref={ref}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            placeholder={props.placeholder}
            type={props.type}
            required={props.required}
            spellCheck={false}
        />
    );
});

export default Input;
