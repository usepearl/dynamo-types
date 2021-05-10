import { DynamoDB } from "aws-sdk";
import { ITable, Table } from "./table";
export declare class SingleTable<T extends "HASH" | "RANGE"> extends Table {
    singleTableType: T;
}
export declare type extractTableType<R> = R extends SingleTable<infer X> ? X : never;
export declare class SingleMetaTableResult {
    private result;
    classRefs: ITable<any>[];
    constructor(result: {
        [className: string]: any[];
    }, classRefs: ITable<any>[]);
    extract<T extends SingleTable<"HASH" | "RANGE">>(classRef: ITable<T>): extractTableType<T> extends "HASH" ? T | undefined : T[];
}
export interface SingleTableHash {
    singleTableType: "HASH";
}
export interface SingleTableRange {
    singleTableType: "RANGE";
}
export declare class SingleMetaTable<HashKeyType = string> {
    private tablesRef;
    private rootRef;
    private key;
    constructor(...ref: ITable<any>[]);
    get(hashKey: HashKeyType, options?: {
        consistent: boolean;
    }): Promise<SingleMetaTableResult>;
    query(hashKey: HashKeyType, options?: {
        order?: "ASC" | "DESC";
        limit?: number;
        classes?: ITable<any>[];
        exclusiveStartKey?: {
            [className: string]: DynamoDB.DocumentClient.Key;
        };
        consistent?: boolean;
    }): Promise<{
        records: SingleMetaTableResult;
        info: {
            [className: string]: {
                count?: number;
                scannedCount?: number;
                lastEvaluatedKey?: DynamoDB.DocumentClient.Key;
                consumedCapacity?: DynamoDB.DocumentClient.ConsumedCapacity;
            };
        };
    }>;
}
