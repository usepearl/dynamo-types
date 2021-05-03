import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { UniqueKey } from "../metadata/unique_key";
export declare const convertToUniquePutInputs: <T extends Table>(tableClass: ITable<T>, record: T, filterKey?: UniqueKey | undefined) => DocumentClient.PutItemInput[];
export declare function put<T extends Table>(tableClass: ITable<T>, record: T, options?: Partial<{
    condition: Conditions<T> | Array<Conditions<T>>;
}>): Promise<T>;
export declare function batchPut<T extends Table>(tableClass: ITable<T>, records: T[]): Promise<void>;
