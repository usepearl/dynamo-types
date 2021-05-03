import { DynamoDB } from "aws-sdk";
import { ITable, Table } from "../table";
import * as Metadata from "../metadata";
import * as Query from "./query";
import { Conditions } from "./expressions/conditions";
import { UpdateChanges } from "./expressions/update";
export declare class FullPrimaryKey<T extends Table, HashKeyType, RangeKeyType> {
    readonly tableClass: ITable<T>;
    readonly metadata: Metadata.Indexes.FullPrimaryKeyMetadata;
    constructor(tableClass: ITable<T>, metadata: Metadata.Indexes.FullPrimaryKeyMetadata);
    delete(hashKey: HashKeyType, sortKey: RangeKeyType, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
    /**
     * @param hashKey - HashKey
     * @param sortKey - sortKey
     * @param options - read options. consistent means "strongly consistent" or not
     */
    get(hashKey: HashKeyType, sortKey: RangeKeyType, options?: {
        consistent: boolean;
    }): Promise<T | null>;
    batchGet(keys: Array<[HashKeyType, RangeKeyType]>): Promise<{
        records: T[];
    }>;
    batchGetFull(keys: Array<[HashKeyType, RangeKeyType]>): Promise<{
        records: (T | undefined)[];
    }>;
    batchDelete(keys: Array<[HashKeyType, RangeKeyType]>): Promise<void>;
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
    update(hashKey: HashKeyType, sortKey: RangeKeyType, changes: Partial<UpdateChanges<T>>, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
}
