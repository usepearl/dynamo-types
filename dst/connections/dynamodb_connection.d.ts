import { Connection } from "./connection";
import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
export declare class DynamoDBConnection implements Connection {
    private __documentClient;
    private __client;
    constructor(options: {
        region?: string;
        endpoint: string | undefined;
        enableAWSXray: boolean;
    });
    private httpAgent;
    get documentClient(): DynamoDB.DocumentClient;
    get client(): AWS.DynamoDB;
}
