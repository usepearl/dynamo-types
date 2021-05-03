import { Operator } from "./operator";
export declare type Conditions<T> = {
    [P in keyof T]?: Operator<Conditions<T[P]>>;
};
