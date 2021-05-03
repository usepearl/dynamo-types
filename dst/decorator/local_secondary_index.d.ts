import { ITable } from "../table";
export declare function LocalSecondaryIndex(rangeKeyName: string, options?: {
    name?: string;
}): (tableClass: ITable<any>, propertyName: string) => void;
