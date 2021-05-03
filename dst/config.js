"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connections_1 = require("./connections");
class Config {
    static get defaultConnection() {
        if (!this.__defaultConnection) {
            this.__defaultConnection = new connections_1.DynamoDBConnection({
                endpoint: process.env.DYNAMO_TYPES_ENDPOINT,
                enableAWSXray: process.env.ENABLE_XRAY === "true",
            });
        }
        return this.__defaultConnection;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map