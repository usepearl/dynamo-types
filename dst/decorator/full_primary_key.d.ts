import { ITable } from "../table";
export declare function FullPrimaryKey(hashKeyName: string, rangeKeyName: string): (tableClass: ITable<any>, propertyKey: string) => void;
