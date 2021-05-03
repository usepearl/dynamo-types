import { Connection } from "./connection";
import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
export declare class DAXConnection implements Connection {
    private __documentClient;
    private __client;
    constructor(options: {
        region?: string;
        endpoints: string[];
        requestTimeout?: number;
    });
    get documentClient(): DynamoDB.DocumentClient;
    get client(): AWS.DynamoDB;
}
