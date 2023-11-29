type Item<T> = {
    label: string,
    value: T
}

type SelectProps<T> = {
    value: string | number | readonly string[],
    items: Item<T>[],
    onChange: (value: T) => void,
    selectMsg?: string
    errorMsg?: string
}

export default function Select<T extends string | number | readonly string[]>(props: SelectProps<T>) {
    const optionItems = props.items.map((item) => (
        <option key={item.label} value={item.value}>{item.label}</option>
    ));
    return (
        <select
            value={props.value}
            onChange={(event) => { props.onChange(event.target.value as T); }}
            required
        >
            <option disabled selected value="">{optionItems.length === 0 ? props.errorMsg : props.selectMsg}</option>
            {optionItems}
        </select>
    );
}
