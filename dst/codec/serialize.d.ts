import { ITable, Table } from "../table";
export declare function serialize<T extends Table>(tableClass: ITable<T>, record: T, withRelationId?: string): {
    [key: string]: any;
};
export declare function serializeUniqueKeyset<T extends Table>(tableClass: ITable<T>, record: T, uniqueKeys: string[]): string;
export declare function serializeClassKeys<T extends Table>(tableClass: ITable<T>, record: {
    [key: string]: any;
}, forRelation: boolean): string;
