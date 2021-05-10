import { ITable } from "../table";
export declare function SingleTableKey(hashKeyName: string, classKeys?: string[]): (tableClass: ITable<any>, propertyKey: string) => void;
export declare function SingleTableRelation(relationKeyName: string, tableName: string, classKeys?: string[], indexName?: string): (tableClass: ITable<any>, propertyKey: string) => void;
