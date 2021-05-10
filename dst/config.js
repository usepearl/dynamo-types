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
    static initializeRelationships(relationships) {
        for (const relationshipFunc of relationships) {
            const relations = relationshipFunc();
            relations.forEach(relation => {
                if (!relation.sideOne.referenceTable.metadata.relationshipKeys.includes(relation)) {
                    relation.sideOne.referenceTable.metadata.relationshipKeys.push(relation);
                }
                if (!relation.sideTwo.referenceTable.metadata.relationshipKeys.includes(relation)) {
                    relation.sideTwo.referenceTable.metadata.relationshipKeys.push(relation);
                }
            });
        }
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map