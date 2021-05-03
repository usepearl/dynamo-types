"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSecondaryIndex = void 0;
const Codec = require("../codec");
const Query = require("./query");
const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";
const RANGE_KEY_REF = "#rk";
class LocalSecondaryIndex {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
    async query(options) {
        if (!options.rangeOrder) {
            options.rangeOrder = "ASC";
        }
        const ScanIndexForward = options.rangeOrder === "ASC";
        const params = {
            TableName: this.tableClass.metadata.name,
            Limit: options.limit,
            IndexName: this.metadata.name,
            ScanIndexForward,
            ExclusiveStartKey: options.exclusiveStartKey,
            ReturnConsumedCapacity: "TOTAL",
            KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
            ExpressionAttributeNames: {
                [HASH_KEY_REF]: this.tableClass.metadata.primaryKey.hash.name,
            },
            ExpressionAttributeValues: {
                [HASH_VALUE_REF]: options.hash,
            },
            ConsistentRead: options.consistent,
        };
        if (options.range) {
            const rangeKeyOptions = Query.parseCondition(options.range, RANGE_KEY_REF);
            params.KeyConditionExpression += ` AND ${rangeKeyOptions.conditionExpression}`;
            Object.assign(params.ExpressionAttributeNames, { [RANGE_KEY_REF]: this.metadata.range.name });
            Object.assign(params.ExpressionAttributeValues, rangeKeyOptions.expressionAttributeValues);
        }
        const result = await this.tableClass.metadata.connection.documentClient.query(params).promise();
        return {
            records: (result.Items || []).map((item) => {
                return Codec.deserialize(this.tableClass, item);
            }),
            count: result.Count,
            scannedCount: result.ScannedCount,
            lastEvaluatedKey: result.LastEvaluatedKey,
            consumedCapacity: result.ConsumedCapacity,
        };
    }
    async scan(options = {}) {
        const params = {
            TableName: this.tableClass.metadata.name,
            Limit: options.limit,
            ExclusiveStartKey: options.exclusiveStartKey,
            ReturnConsumedCapacity: "TOTAL",
            TotalSegments: options.totalSegments,
            Segment: options.segment,
        };
        const result = await this.tableClass.metadata.connection.documentClient.scan(params).promise();
        return {
            records: (result.Items || []).map((item) => {
                return Codec.deserialize(this.tableClass, item);
            }),
            count: result.Count,
            scannedCount: result.ScannedCount,
            lastEvaluatedKey: result.LastEvaluatedKey,
            consumedCapacity: result.ConsumedCapacity,
        };
    }
}
exports.LocalSecondaryIndex = LocalSecondaryIndex;
//# sourceMappingURL=local_secondary_index.js.map