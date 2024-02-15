import { BsGrid3X3, BsRegex } from "react-icons/bs";
import { forwardRef, useEffect, useRef, useState } from "react";
import { mergeProps, useLongPress, usePress } from "react-aria";
import Input from "./Input";
import clsx from "clsx";
import levenshtein from "js-levenshtein";



export type ComparatorType = "None" | "ExactMatch" | "RegEx" | "Levenshtein";



interface ComparatorButtonProps extends React.ComponentProps<"button"> {
    selected: boolean
}

function ComparatorButton({ selected, ...props }: ComparatorButtonProps) {
    return (
        <button
            type="button"
            className={clsx(
                "relative px-[4px] hover:bg-neutral-200 active:bg-neutral-300 rounded",
                { "ring-1 ring-inset ring-neutral-700": selected }
            )}
            {...props}
        >{props.children}</button>
    );
}



type LevenshteinComparatorButtonProps = {
    selected: boolean,
    onSelected: () => void,
    editDistance: number,
    setEditDistance: (editDistance: number) => void,
}

function LevenshteinComparatorButton(props: LevenshteinComparatorButtonProps) {
    const navPanelRef = useRef<HTMLDivElement>(null);
    const [navPanelOpen, setNavPanelOpen]= useState(false);
    const { longPressProps } = useLongPress({
        onLongPress: () => { setNavPanelOpen(true); }
    });
    const { pressProps } = usePress({
        onPress: () => { props.onSelected(); }
    });


    useEffect(() => {
        const handleClickEvent = (event: MouseEvent) => {
            if (!navPanelRef.current?.contains(event.target as Node)) {
                setNavPanelOpen(false);
            }
        };

        window.addEventListener("pointerdown", handleClickEvent);
        
        return () => {
            window.removeEventListener("pointerdown", handleClickEvent);
        };
    }, [setNavPanelOpen]);


    return (
        <div className="flex">
            <ComparatorButton
                title="Levenshtein Distance (Hold to change edit distance value)"
                selected={props.selected}
                {...mergeProps(pressProps, longPressProps)}
            ><BsGrid3X3 /></ComparatorButton>
            {navPanelOpen &&
            <div
                ref={navPanelRef}
                className={clsx(
                    "top-[28px] right-0 absolute z-50",
                    "flex flex-col bg-neutral-50 shadow-lg shadow-neutral-700 rounded overflow-y-auto",
                    "border border-neutral-700"
                )}
            >
                <div className="p-[10px] flex flex-col rounded">
                    <span className="self-start">Edit Distance:</span>
                    <div className="flex gap-x-[10px]">
                        <input
                            type="range"
                            min={1}
                            max={20}
                            value={props.editDistance}
                            onChange={(e) => { props.setEditDistance(e.target.valueAsNumber); }}
                        />
                        <Input
                            type="number"
                            min={1}
                            max={20}
                            value={props.editDistance}
                            onChange={(e) => { props.setEditDistance(e.target.valueAsNumber); }}
                        />
                    </div>
                </div>
            </div>}
        </div>
    );
}



type ComparatorBarProps = {
    className?: string,
    comparatorType: ComparatorType,
    setComparatorType: (newComparatorType: ComparatorType) => void,
    editDistance: number,
    setEditDistance: (editDistance: number) => void,
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
                selected={props.comparatorType === "ExactMatch"}
                onClick={() => { setNewComparatorType("ExactMatch"); }}
            ><span className="text-sm">Ab</span></ComparatorButton>
            <ComparatorButton
                title="Regular Expression"
                selected={props.comparatorType === "RegEx"}
                onClick={() => { setNewComparatorType("RegEx"); }}
            ><BsRegex /></ComparatorButton>
            <LevenshteinComparatorButton
                selected={props.comparatorType === "Levenshtein"}
                onSelected={() => { setNewComparatorType("Levenshtein"); }}
                editDistance={props.editDistance}
                setEditDistance={props.setEditDistance}
            />
        </div>
    );
}



interface SearchInputProps extends React.ComponentPropsWithoutRef<"input"> {
    filter: string,
    comparatorType: ComparatorType,
    setComparatorType: (newComparatorType: ComparatorType) => void,
    setComparator: (newComparator: () => (value: string) => boolean) => void,
    editDistance: number,
    setEditDistance: (editDistance: number) => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    function SearchInput({
        filter,
        comparatorType,
        setComparatorType,
        setComparator,
        editDistance,
        setEditDistance,
        className,
        ...props
    }, ref) {
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
                    setComparator(() => (value: string) => levenshtein(value, filter) <= editDistance);
                    break;
                }
                default: {
                    const unreachable: never = comparatorType;
                    throw new Error(`Invalid comparator type: ${unreachable}`);
                }
            }
        }, [comparatorType, editDistance, filter, setComparator]);


        return (
            <div className={clsx("relative flex items-center", className)}>
                <Input
                    ref={ref}
                    className={clsx("grow", { "border-red-500": error !== null })}
                    value={filter}
                    placeholder="Find"
                    type="search"
                    {...props}
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
                    editDistance={editDistance}
                    setEditDistance={setEditDistance}
                />
            </div>
        );
    }
);
