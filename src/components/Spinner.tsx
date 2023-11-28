import clsx from "clsx";

export default function Spinner() {
    return (
        <div className={clsx(
            "border-gray-300 h-[30px] w-[30px] animate-spin rounded-full border-[5px] border-t-gray-800"
        )} />
    );
}
