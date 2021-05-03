export declare type UpdateAction = "ADD" | "PUT" | "DELETE";
export declare type UpdateChanges<T> = {
    [P in keyof T]?: [UpdateAction, T[P]];
};
