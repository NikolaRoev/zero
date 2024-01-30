import clsx from "clsx";



type OptionProps<T> = {
    children: React.ReactNode,
    value: T
}

export function Option<T extends string>(props: OptionProps<T>) {
    return <option value={props.value}>{props.children}</option>;
}

type SelectProps<T> = {
    id?: string,
    children: React.ReactElement<OptionProps<T>>[],
    value: T,
    onChange: (value: T) => void,
    className?: string,
    name?: string,
    selectMsg?: string
    errorMsg?: string
}

export function Select<T extends string>(props: SelectProps<T>) {
    return (
        <select
            id={props.id}
            name={props.name}
            className={clsx(
                "px-[5px] py-[2px] border border-neutral-700 rounded focus:outline-none",
                props.className
            )}
            value={props.value}
            onChange={(event) => { props.onChange(event.target.value as T); }}
            required
        >
            <option disabled value="">{props.children.length ? props.selectMsg: props.errorMsg }</option>
            {props.children}
        </select>
    );
}
