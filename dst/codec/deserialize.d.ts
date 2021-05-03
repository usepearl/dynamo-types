import { DynamoDB } from "aws-sdk";
import { ITable, Table } from "../table";
export declare function deserialize<T extends Table>(tableClass: ITable<T>, dynamoAttributes: DynamoDB.DocumentClient.AttributeMap, filterKeys?: string[]): T;
export declare function unmarshal<T extends Table>(tableClass: ITable<T>, dynamoAttributes: DynamoDB.AttributeMap): T;
