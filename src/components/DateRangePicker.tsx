import {
    type AriaButtonProps,
    type AriaCalendarCellProps,
    type AriaCalendarGridProps,
    type AriaDialogProps,
    type AriaPopoverProps,
    type AriaRangeCalendarProps,
    type DateValue,
    DismissButton,
    Overlay,
    useButton,
    useCalendarCell,
    useCalendarGrid,
    useDateField,
    useDateRangePicker,
    useDateSegment,
    useDialog,
    useLocale,
    usePopover,
    useRangeCalendar
} from "react-aria";
import type { AriaDateFieldOptions, AriaDateRangePickerProps } from "@react-aria/datepicker";
import { BsCalendar4Range, BsChevronLeft, BsChevronRight } from "react-icons/bs";
import {
    type DateFieldState,
    type DateSegment,
    type OverlayTriggerState,
    type RangeCalendarState,
    useDateFieldState,
    useDateRangePickerState,
    useRangeCalendarState
} from "react-stately";
import { createCalendar, getLocalTimeZone, getWeeksInMonth, isSameDay, isToday } from "@internationalized/date";
import clsx from "clsx";
import { useRef } from "react";



function Button(props: AriaButtonProps & { className?: string }) {
    const ref = useRef(null);
    const { buttonProps } = useButton(props, ref);

    return (
        <button
            ref={ref}
            className={clsx("hover:bg-neutral-200 active:bg-neutral-300", props.className)}
            {...buttonProps}
        >{props.children}</button>
    );
}


function Dialog(props: AriaDialogProps & { children: React.ReactNode }) {
    const ref = useRef(null);
    const { dialogProps } = useDialog(props, ref);

    return <div {...dialogProps} ref={ref}>{props.children}</div>;
}


function Popover(props: Omit<AriaPopoverProps, "popoverRef"> & { children: React.ReactNode, state: OverlayTriggerState }) {
    const popoverRef = useRef(null);
    const { popoverProps, underlayProps } = usePopover({ ...props, popoverRef }, props.state);

    return (
        <Overlay>
            <div {...underlayProps} />
            <div
                {...popoverProps}
                ref={popoverRef}
                style={{ ...popoverProps.style }}
                className="bg-neutral-50 border border-neutral-700 rounded"
            >
                <DismissButton onDismiss={() => { props.state.close(); }} />
                {props.children}
                <DismissButton onDismiss={() => { props.state.close(); }} />
            </div>
        </Overlay>
    );
}



function CalendarCell(props: AriaCalendarCellProps & { state: RangeCalendarState }) {
    const ref = useRef(null);
    const {
        cellProps,
        buttonProps,
        isSelected,
        isOutsideVisibleRange,
        formattedDate
    } = useCalendarCell(props, props.state, ref);
    
    const isSelectionStart = isSelected &&
                             props.state.highlightedRange &&
                             isSameDay(props.date, props.state.highlightedRange.start);
    const isSelectionEnd = isSelected &&
                           props.state.highlightedRange &&
                           isSameDay(props.date, props.state.highlightedRange.end);
    const isCellToday = isToday(props.date, getLocalTimeZone());

    return (
        <td {...cellProps}>
            <div
                {...buttonProps}
                ref={ref}
                hidden={isOutsideVisibleRange}
                className={clsx(
                    "p-[3px] rounded",
                    { "rounded": isSelected },
                    { "hover:bg-blue-200": !isSelectionStart && !isSelectionEnd },
                    { "bg-neutral-300": isSelected && !isSelectionStart && !isSelectionEnd },
                    { "text-neutral-50 bg-blue-400 hover:bg-blue-500 ": isSelectionStart ?? isSelectionEnd },
                    { "border border-neutral-700": isCellToday }
                )}
            ><span className="flex justify-center">{formattedDate}</span></div>
        </td>
    );
}


function CalendarGrid(props: AriaCalendarGridProps & { state: RangeCalendarState }) {
    const { locale } = useLocale();
    const { gridProps, headerProps, weekDays } = useCalendarGrid(props, props.state);

    const weeksInMonth = getWeeksInMonth(props.state.visibleRange.start, locale);

    return (
        <table {...gridProps}>
            <thead {...headerProps}>
                <tr>{weekDays.map((day, index) => <th key={index}>{day}</th>)}</tr>
            </thead>
            <tbody>
                {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
                    <tr key={weekIndex}>
                        {props.state.getDatesInWeek(weekIndex).map((date, i) => (
                            date ? <CalendarCell key={i} state={props.state} date={date} /> : <td key={i} />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


function RangeCalendar(props: AriaRangeCalendarProps<DateValue>) {
    const { locale } = useLocale();
    const state = useRangeCalendarState({ ...props, locale, createCalendar });
  
    const ref = useRef(null);
    const { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar(props, state, ref);
  
    return (
        <div {...calendarProps} ref={ref} className="p-[5px]">
            <div className="pb-[5px] flex">
                <span className="font-bold">{title}</span>
                <div className="ml-auto flex justify-center">
                    <Button {...prevButtonProps}><BsChevronLeft /></Button>
                    <Button {...nextButtonProps}><BsChevronRight /></Button>
                </div>
            </div>
            <CalendarGrid state={state} />
        </div>
    );
}



function DateSegmentComponent({ segment, state }: { segment: DateSegment, state: DateFieldState }) {
    const ref = useRef(null);
    const { segmentProps } = useDateSegment(segment, state, ref);

    return (
        <div
            {...segmentProps}
            ref={ref}
            className={clsx(
                { "text-neutral-500": segment.isPlaceholder },
                "focus:bg-neutral-300 focus:outline-none rounded"
            )}
        >{segment.text}</div>
    );
}


function formatDateFieldSegments(segments: DateSegment[]): DateSegment[] {
    const daySegment = segments.find((segment) => segment.type === "day");
    const monthSegment = segments.find((segment) => segment.type === "month");
    const yearSegment = segments.find((segment) => segment.type === "year");
    const separatorSegment = segments.find(
        (segment) => segment.type === "literal"
    );

    if (!daySegment || !monthSegment || !yearSegment || !separatorSegment) {
        throw new Error("Invalid date field segments.");
    }

    const formattedDaySegment = {
        ...daySegment,
        text: daySegment.text.padStart(2, "0")
    };
    const formattedMonthSegment = {
        ...monthSegment,
        text: monthSegment.text.padStart(2, "0")
    };
    const formattedSeparatorSegment = { ...separatorSegment, text: "-" };

    return [
        formattedDaySegment,
        formattedSeparatorSegment,
        formattedMonthSegment,
        formattedSeparatorSegment,
        yearSegment
    ];
}

function DateField(props: AriaDateFieldOptions<DateValue>) {
    const { locale } = useLocale();
    const state = useDateFieldState({ ...props, locale, createCalendar });
    const ref = useRef(null);
    const { labelProps, fieldProps } = useDateField(props, state, ref);

    return (
        <div className="flex">
            <span {...labelProps}>{props.label}</span>
            <div {...fieldProps} ref={ref} className="flex">
                {formatDateFieldSegments(state.segments).map((segment, i) => (
                    <DateSegmentComponent key={i} segment={segment} state={state} />
                ))}
            </div>
        </div>
    );
}


export function DateRangePicker(props: AriaDateRangePickerProps<DateValue>) {
    const state = useDateRangePickerState(props);
    const ref = useRef(null);
    const {
        labelProps,
        groupProps,
        startFieldProps,
        endFieldProps,
        buttonProps,
        dialogProps,
        calendarProps
    } = useDateRangePicker(props, state, ref);

    return (
        <div className="flex flex-col">
            <span className="text-xs" {...labelProps}>{props.label}</span>
            <div className="flex">
                <div
                    ref={ref}
                    className={clsx(
                        "min-w-[205px] flex p-[3px] border border-neutral-700 rounded-l",
                        { "bg-red-100": state.isInvalid }
                    )}
                    {...groupProps}
                >
                    <div className={"flex gap-x-[5px]"}>
                        <DateField {...startFieldProps} />
                        <span>:</span>
                        <DateField {...endFieldProps} />
                    </div>
                </div>
                <Button
                    className="flex justify-center min-w-[32px] border border-l-0 border-neutral-700 rounded-r"
                    {...buttonProps}
                ><BsCalendar4Range className="self-center" /></Button>

                {state.isOpen && (
                    <Popover state={state} triggerRef={ref} placement="bottom start">
                        <Dialog {...dialogProps}>
                            <RangeCalendar {...calendarProps} />
                        </Dialog>
                    </Popover>
                )}
            </div>
        </div>
    );
}
