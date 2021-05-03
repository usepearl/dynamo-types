import { DynamoDB } from "aws-sdk";
import { ITable, Table } from "../table";
import * as Metadata from "../metadata";
import * as Query from "./query";
export declare class FullGlobalSecondaryIndex<T extends Table, HashKeyType, RangeKeyType> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Indexes.FullGlobalSecondaryIndexMetadata;
    constructor(tableClass: ITable<T>, metadata: Metadata.Indexes.FullGlobalSecondaryIndexMetadata);
    query(options: {
        hash: HashKeyType;
        range?: Query.Conditions<RangeKeyType>;
        rangeOrder?: "ASC" | "DESC";
        limit?: number;
        exclusiveStartKey?: DynamoDB.DocumentClient.Key;
        consistent?: boolean;
    }): Promise<{
        records: T[];
        count: number | undefined;
        scannedCount: number | undefined;
        lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;
        consumedCapacity: DynamoDB.DocumentClient.ConsumedCapacity | undefined;
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
}
export declare class HashGlobalSecondaryIndex<T extends Table, HashKeyType> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Indexes.HashGlobalSecondaryIndexMetadata;
    constructor(tableClass: ITable<T>, metadata: Metadata.Indexes.HashGlobalSecondaryIndexMetadata);
    query(hash: HashKeyType, options?: {
        limit?: number;
        consistent?: boolean;
    }): Promise<{
        records: T[];
        count: number | undefined;
        scannedCount: number | undefined;
        lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;
        consumedCapacity: DynamoDB.DocumentClient.ConsumedCapacity | undefined;
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
}
