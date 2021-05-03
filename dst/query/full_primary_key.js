"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullPrimaryKey = void 0;
const Codec = require("../codec");
const Query = require("./query");
const batch_get_1 = require("./batch_get");
const batch_write_1 = require("./batch_write");
const transformers_1 = require("./expressions/transformers");
const delete_1 = require("./delete");
const HASH_KEY_REF = "#hk";
const HASH_VALUE_REF = ":hkv";
const RANGE_KEY_REF = "#rk";
class FullPrimaryKey {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
    async delete(hashKey, sortKey, options = {}) {
        return delete_1.deleteItem(this.tableClass, {
            [this.metadata.hash.name]: hashKey,
            [this.metadata.range.name]: sortKey,
        }, options);
    }
    /**
     * @param hashKey - HashKey
     * @param sortKey - sortKey
     * @param options - read options. consistent means "strongly consistent" or not
     */
    async get(hashKey, sortKey, options = { consistent: false }) {
        const dynamoRecord = await this.tableClass.metadata.connection.documentClient.get({
            TableName: this.tableClass.metadata.name,
            Key: {
                [this.metadata.hash.name]: hashKey,
                [this.metadata.range.name]: sortKey,
            },
            ConsistentRead: options.consistent,
        }).promise();
        if (!dynamoRecord.Item) {
            return null;
        }
        else {
            return Codec.deserialize(this.tableClass, dynamoRecord.Item);
        }
    }
    async batchGet(keys) {
        const res = await batch_get_1.batchGetTrim(this.tableClass.metadata.connection.documentClient, this.tableClass.metadata.name, keys.map((key) => {
            return {
                [this.metadata.hash.name]: key[0],
                [this.metadata.range.name]: key[1],
            };
        }));
        return {
            records: res.map((item) => {
                return Codec.deserialize(this.tableClass, item);
            }),
        };
    }
    async batchGetFull(keys) {
        const res = await batch_get_1.batchGetFull(this.tableClass.metadata.connection.documentClient, this.tableClass.metadata.name, keys.map((key) => {
            return {
                [this.metadata.hash.name]: key[0],
                [this.metadata.range.name]: key[1],
            };
        }));
        return {
            records: res.map((item) => {
                return item ? Codec.deserialize(this.tableClass, item) : undefined;
            }),
        };
    }
    async batchDelete(keys) {
        const hasUniqueKeys = this.tableClass.metadata.uniqueKeys.length > 0;
        if (hasUniqueKeys) {
            for (const key of keys) {
                await delete_1.deleteItem(this.tableClass, key);
            }
            return;
        }
        return await batch_write_1.batchWrite(this.tableClass.metadata.connection.documentClient, this.tableClass.metadata.name, keys.map((key) => {
            return {
                DeleteRequest: {
                    Key: {
                        [this.metadata.hash.name]: key[0],
                        [this.metadata.range.name]: key[1],
                    },
                },
            };
        }));
    }
    async query(options) {
        if (!options.rangeOrder) {
            options.rangeOrder = "ASC";
        }
        const ScanIndexForward = options.rangeOrder === "ASC";
        const params = {
            TableName: this.tableClass.metadata.name,
            Limit: options.limit,
            ScanIndexForward,
            ExclusiveStartKey: options.exclusiveStartKey,
            ReturnConsumedCapacity: "TOTAL",
            KeyConditionExpression: `${HASH_KEY_REF} = ${HASH_VALUE_REF}`,
            ExpressionAttributeNames: {
                [HASH_KEY_REF]: this.metadata.hash.name,
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
    async update(hashKey, sortKey, changes, options = {}) {
        const update = transformers_1.buildUpdate(this.tableClass.metadata, changes);
        const condition = transformers_1.buildCondition(this.tableClass.metadata, options.condition);
        const updateInput = {
            TableName: this.tableClass.metadata.name,
            Key: {
                [this.metadata.hash.name]: hashKey,
                [this.metadata.range.name]: sortKey,
            },
            UpdateExpression: update.UpdateExpression,
            ConditionExpression: condition.ConditionExpression,
            ExpressionAttributeNames: Object.assign(Object.assign({}, update.ExpressionAttributeNames), condition.ExpressionAttributeNames),
            ExpressionAttributeValues: Object.assign(Object.assign({}, update.ExpressionAttributeValues), condition.ExpressionAttributeValues),
        };
        if (this.tableClass.metadata.uniqueKeys.length === 0) {
            await this.tableClass.metadata.connection.documentClient.update(updateInput).promise();
        }
        else {
            const updates = await transformers_1.buildUniqueKeyUpdates(this.tableClass, changes, {
                [this.metadata.hash.name]: hashKey,
                [this.metadata.range.name]: sortKey,
            });
            await this.tableClass.metadata.connection.documentClient.transactWrite({
                TransactItems: [{
                        Update: updateInput
                    },
                    ...updates]
            });
        }
    }
}
exports.FullPrimaryKey = FullPrimaryKey;
//# sourceMappingURL=full_primary_key.js.map