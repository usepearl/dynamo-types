import { DynamoDB } from "aws-sdk";
/**
 *
 * @param documentClient
 * @param tableName
 * @param keys
 * @param trimMissing - when given key doesn't have matching record,
 * return "undefined" for index? or just remove it (default is true)
 */
export declare function __batchGet(documentClient: DynamoDB.DocumentClient, tableName: string, keys: DynamoDB.DocumentClient.KeyList): Promise<(DynamoDB.DocumentClient.AttributeMap | undefined)[]>;
export declare function batchGetFull(documentClient: DynamoDB.DocumentClient, tableName: string, keys: DynamoDB.DocumentClient.KeyList): Promise<(DynamoDB.DocumentClient.AttributeMap | undefined)[]>;
export declare function batchGetTrim(documentClient: DynamoDB.DocumentClient, tableName: string, keys: DynamoDB.DocumentClient.KeyList): Promise<DynamoDB.DocumentClient.AttributeMap[]>;
