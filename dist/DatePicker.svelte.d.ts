import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        value?: Date | null | undefined;
        start?: number | undefined;
        offset?: number | undefined;
        days?: string[] | undefined;
        months?: string[] | undefined;
        id?: string | undefined;
        show?: boolean | undefined;
        xOffset?: number | undefined;
        yOffset?: number | undefined;
        modal?: boolean | undefined;
        showToday?: boolean | undefined;
        blockedDates?: Date[] | undefined;
        blockPastDays?: boolean | undefined;
        blockedDaysOfWeek?: number[] | undefined;
        todayStyle?: string | undefined;
        selectedStyle?: string | undefined;
        blockedStyle?: string | undefined;
        hoverStyle?: string | undefined;
    };
    events: {
        dateSelected: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type DatePickerProps = typeof __propDef.props;
export type DatePickerEvents = typeof __propDef.events;
export type DatePickerSlots = typeof __propDef.slots;
export default class DatePicker extends SvelteComponentTyped<DatePickerProps, DatePickerEvents, DatePickerSlots> {
}
export {};
