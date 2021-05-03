import { DynamoDB } from "aws-sdk";
import * as Metadata from "../metadata";
import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
import { UpdateChanges } from "./expressions/update";
export declare class HashPrimaryKey<T extends Table, HashKeyType> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Indexes.HashPrimaryKeyMetadata;
    constructor(tableClass: ITable<T>, metadata: Metadata.Indexes.HashPrimaryKeyMetadata);
    delete(hashKey: HashKeyType, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
    get(hashKey: HashKeyType, options?: {
        consistent: boolean;
    }): Promise<T | null>;
    scan(options?: {
        limit?: number;
        totalSegments?: number;
        segment?: number;
        exclusiveStartKey?: DynamoDB.DocumentClient.Key;
    }): Promise<{
        records: T[];
        count: number | undefined;
        scannedCount: number | undefined;
        lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;
        consumedCapacity: DynamoDB.DocumentClient.ConsumedCapacity | undefined;
    }>;
    batchGet(keys: HashKeyType[]): Promise<{
        records: T[];
    }>;
    batchGetFull(keys: HashKeyType[]): Promise<{
        records: (T | undefined)[];
    }>;
    batchDelete(keys: HashKeyType[]): Promise<void>;
    update(hashKey: HashKeyType, changes: Partial<UpdateChanges<T>>, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
}
