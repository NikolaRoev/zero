import clsx from "clsx";
import { useId } from "react";



type CheckboxProps = {
    key: React.Key,
    checked: boolean,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    labelContents: React.ReactNode,
    labelClassName?: string,
    labelTitle?: string | undefined
}

function Checkbox(props: CheckboxProps) {
    const id = useId();
    
    return (
        <div className="flex items-center gap-x-[5px]">
            <input
                id={id}
                type="checkbox"
                checked={props.checked}
                onChange={props.onChange}
                autoComplete="off"
            />
            <label
                htmlFor={id}
                title={props.labelTitle}
                className={props.labelClassName}
            >{props.labelContents}</label>
        </div>
    );
}


type CheckboxGroupProps<T> = {
    className?: string,
    legend: React.ReactNode,
    items: T[],
    checkboxContent: (item: T) => CheckboxProps
}

export default function CheckboxGroup<T>(props: CheckboxGroupProps<T>) {
    return (
        <fieldset className={clsx(
            "px-[10px] pb-[5px] flex flex-wrap content-start",
            "border border-neutral-700 rounded gap-x-[20px] gap-y-[5px]",
            props.className
        )}>
            <legend>{props.legend}</legend>
            {props.items.map((item) => {
                const {key, ...rest} = props.checkboxContent(item);
                return (<Checkbox key={key} {...rest} />);
            })}
        </fieldset>
    );
}
