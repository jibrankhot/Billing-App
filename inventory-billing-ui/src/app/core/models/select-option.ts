export interface SelectOption<T = string | number> {
    label: string;
    value: T;
    disabled?: boolean;
}