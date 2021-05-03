"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBConnection = void 0;
const AWS = require("aws-sdk");
const aws_sdk_1 = require("aws-sdk");
const HTTP = require("http");
const HTTPS = require("https");
class DynamoDBConnection {
    constructor(options) {
        const dynamoDBOptions = {
            region: options.region,
            endpoint: options.endpoint,
            httpOptions: {
                agent: this.httpAgent(options.endpoint),
            },
        };
        if (options.enableAWSXray) {
            // Since "require" itself does something for this lib, such as logging
            // importing this only when it's needed
            const AWSXRay = require("aws-xray-sdk-core");
            const aws = AWSXRay.captureAWS(AWS);
            this.__client = new aws.DynamoDB(dynamoDBOptions);
            this.__documentClient = new aws.DynamoDB.DocumentClient({
                service: this.__client,
            });
        }
        else {
            this.__client = new aws_sdk_1.DynamoDB(dynamoDBOptions);
            this.__documentClient = new aws_sdk_1.DynamoDB.DocumentClient({
                service: this.__client,
            });
        }
    }
    httpAgent(endpoint) {
        if (endpoint && endpoint.startsWith("http://")) {
            return new HTTP.Agent({
                keepAlive: true,
            });
        }
        else {
            return new HTTPS.Agent({
                rejectUnauthorized: true,
                keepAlive: true,
            });
        }
    }
    get documentClient() {
        return this.__documentClient;
    }
    get client() {
        return this.__client;
    }
}
exports.DynamoDBConnection = DynamoDBConnection;
//# sourceMappingURL=dynamodb_connection.js.map