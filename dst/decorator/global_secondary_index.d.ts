import { ITable } from "../table";
export declare function FullGlobalSecondaryIndex(hashKeyName: string, rangeKeyName: string, options?: {
    name?: string;
}): (tableClass: ITable<any>, propertyName: string) => void;
export declare function HashGlobalSecondaryIndex(hashKeyName: string, options?: {
    name?: string;
}): (tableClass: ITable<any>, propertyName: string) => void;
