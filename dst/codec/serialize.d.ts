import { ITable, Table } from "../table";
export declare function serialize<T extends Table>(tableClass: ITable<T>, record: T): {
    [key: string]: any;
};
export declare function serializeUniqueKeyset<T extends Table>(tableClass: ITable<T>, record: T, uniqueKeys: string[]): string;
