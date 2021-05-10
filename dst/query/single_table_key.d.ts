import { DynamoDB } from "aws-sdk";
import * as Metadata from "../metadata";
import { extractTableType, SingleTable } from "../single_table";
import { ITable } from "../table";
import { Conditions } from "./expressions/conditions";
import { UpdateChanges } from "./expressions/update";
export declare class SingleTableKey<T extends SingleTable<"HASH" | "RANGE">, HashKeyType> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Indexes.SingleTableKeyMetadata;
    constructor(tableClass: ITable<T>, metadata: Metadata.Indexes.SingleTableKeyMetadata);
    delete(hashKey: HashKeyType, classKeys?: {
        [key: string]: any;
    }, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
    get(hashKey: HashKeyType, classKeys?: {
        [key: string]: any;
    }, options?: {
        consistent?: boolean;
    }): Promise<T | null>;
    query(hashKey: HashKeyType, options?: {
        order?: "ASC" | "DESC";
        limit?: number;
        exclusiveStartKey?: DynamoDB.DocumentClient.Key;
        consistent?: boolean;
    }): Promise<{
        records: extractTableType<T> extends "HASH" ? T | null : T[];
        count?: number;
        scannedCount?: number;
        lastEvaluatedKey?: DynamoDB.DocumentClient.Key;
        consumedCapacity?: DynamoDB.DocumentClient.ConsumedCapacity;
    }>;
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
    update(hashKey: HashKeyType, classKeys: {
        [key: string]: any;
    } | undefined, changes: Partial<UpdateChanges<T>>, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
}
