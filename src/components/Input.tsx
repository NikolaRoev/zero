import { forwardRef } from "react";



type InputProps = {
    name?: string,
    value?: string | number | readonly string[],
    onChange?: React.ChangeEventHandler<HTMLInputElement>,
    placeholder?: string,
    type?: string
    required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
    return (
        <input
            className="grow overflow-ellipsis"
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
