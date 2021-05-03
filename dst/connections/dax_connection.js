"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAXConnection = void 0;
const aws_sdk_1 = require("aws-sdk");
const AmazonDaxClient = require("amazon-dax-client"); // tslint:disable-line
class DAXConnection {
    constructor(options) {
        this.__client = new AmazonDaxClient({
            region: options.region,
            endpoints: options.endpoints,
            requestTimeout: options.requestTimeout,
        });
        this.__documentClient = new aws_sdk_1.DynamoDB.DocumentClient({
            service: this.__client,
        });
    }
    get documentClient() {
        return this.__documentClient;
    }
    get client() {
        return this.__client;
    }
}
exports.DAXConnection = DAXConnection;
//# sourceMappingURL=dax_connection.js.map