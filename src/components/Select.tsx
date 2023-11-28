type Item<T> = {
    label: string,
    value: T
}

type SelectProps<T> = {
    value: string | number | readonly string[],
    items: Item<T>[],
    onChange: (value: T) => void
}

export default function Select<T extends string | number | readonly string[]>({ value, items, onChange }: SelectProps<T>) {
    const optionItems = items.map((item) => (
        <option key={item.label} value={item.value}>{item.label}</option>
    ));
    return (
        <select value={value} onChange={(event) => { onChange(event.target.value as T); }}>
            {optionItems}
        </select>
    );
}
