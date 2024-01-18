import { BsGrid3X3, BsRegex } from "react-icons/bs";
import { forwardRef, useEffect, useState } from "react";
import Input from "./Input";
import clsx from "clsx";
import levenshtein from "js-levenshtein";



export type ComparatorType = "None" | "ExactMatch" | "RegEx" | "Levenshtein";



type ComparatorButtonProps = {
    children: React.ReactNode,
    title: string,
    buttonComparatorType: ComparatorType,
    comparatorType: ComparatorType,
    setNewComparatorType: (newComparatorType: ComparatorType) => void,
}

function ComparatorButton(props: ComparatorButtonProps) {
    return (
        <button
            type="button"
            className={clsx(
                "px-[4px] hover:bg-neutral-200 active:bg-neutral-300 rounded",
                { "ring-1 ring-inset ring-neutral-700": props.buttonComparatorType === props.comparatorType }
            )}
            title={props.title}
            onClick={() => { props.setNewComparatorType(props.buttonComparatorType); }}
        >{props.children}</button>
    );
}


type ComparatorBarProps = {
    comparatorType: ComparatorType,
    setComparatorType: (newComparatorType: ComparatorType) => void,
    className?: string
}

function ComparatorBar(props: ComparatorBarProps) {
    function setNewComparatorType(newComparatorType: ComparatorType) {
        if (props.comparatorType === newComparatorType) {
            props.setComparatorType("None");
        }
        else {
            props.setComparatorType(newComparatorType);
        }
    }


    return (
        <div className={clsx("flex gap-x-[3px]", props.className)}>
            <ComparatorButton
                title="Exact Match"
                buttonComparatorType={"ExactMatch"}
                comparatorType={props.comparatorType}
                setNewComparatorType={setNewComparatorType}
            ><span className="text-sm">Ab</span></ComparatorButton>
            <ComparatorButton
                title="Regular Expression"
                buttonComparatorType={"RegEx"}
                comparatorType={props.comparatorType}
                setNewComparatorType={setNewComparatorType}
            ><BsRegex /></ComparatorButton>
            <ComparatorButton
                title="Levenshtein Distance"
                buttonComparatorType={"Levenshtein"}
                comparatorType={props.comparatorType}
                setNewComparatorType={setNewComparatorType}
            ><BsGrid3X3 /></ComparatorButton>
        </div>
    );
}



type SearchInputProps = {
    filter: string,
    comparatorType: ComparatorType,
    setComparatorType: (newComparatorType: ComparatorType) => void,
    setComparator: (newComparator: () => (value: string) => boolean) => void,
    name: string | undefined,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    className?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    function SearchInput({ filter, comparatorType, setComparatorType, setComparator, name, onChange, className }, ref) {
        const [error, setError] = useState<string | null>(null);
        

        useEffect(() => {
            switch (comparatorType) {
                case "None": {
                    setError(null);
                    setComparator(() => (value: string) => value.toLowerCase().includes(filter.toLowerCase()));
                    break;
                }
                case "ExactMatch": {
                    setError(null);
                    setComparator(() => (value: string) => value === filter);
                    break;
                }
                case "RegEx": {
                    try {
                        const regex = new RegExp(filter);
                        setError(null);
                        setComparator(() => (value: string) => regex.test(value));
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            setError(e.message);
                        }
                        setComparator(() => () => false);
                    }
                    break;
                }
                case "Levenshtein": {
                    setError(null);
                    setComparator(() => (value: string) => levenshtein(value, filter) < 10);
                    break;
                }
                default: {
                    const unreachable: never = comparatorType;
                    throw new Error(`Invalid comparator type: ${unreachable}`);
                }
            }
        }, [comparatorType, filter, setComparator]);


        return (
            <div className={clsx("relative flex items-center", className)}>
                <Input
                    ref={ref}
                    className={clsx("grow", { "border-red-500": error !== null })}
                    name={name}
                    value={filter}
                    placeholder="Find"
                    type="search"
                    onChange={onChange}
                />
                {error && <span
                    className="p-[3px] absolute w-[100%] top-[100%] z-50 bg-neutral-50 text-sm border border-red-500 rounded"
                >{error}</span>}
                <ComparatorBar
                    className="absolute right-[30px]"
                    comparatorType={comparatorType}
                    setComparatorType={(newComparatorType: ComparatorType) => {
                        setComparatorType(newComparatorType);
                    }}
                />
            </div>
        );
    }
);
