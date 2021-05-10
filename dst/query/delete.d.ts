import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UniqueKey } from "../metadata/unique_key";
import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
export declare function convertToUniqueDeleteInputs<T extends Table>(tableClass: ITable<T>, record: T, filterKey?: UniqueKey): DocumentClient.DeleteItemInput[];
export declare function deleteItem<T extends Table>(tableClass: ITable<T>, keys: {
    [key: string]: any;
}, options?: Partial<{
    condition: Conditions<T> | Array<Conditions<T>>;
    relationKey?: string;
}>): Promise<void>;
