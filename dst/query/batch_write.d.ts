import { DynamoDB } from "aws-sdk";
export declare function batchWrite(documentClient: DynamoDB.DocumentClient, tableName: string, requests: DynamoDB.DocumentClient.WriteRequest[]): Promise<void>;
