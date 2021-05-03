"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashPrimaryKey = void 0;
const Codec = require("../codec");
const batch_get_1 = require("./batch_get");
const batch_write_1 = require("./batch_write");
const delete_1 = require("./delete");
const transformers_1 = require("./expressions/transformers");
class HashPrimaryKey {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
    async delete(hashKey, options = {}) {
        return delete_1.deleteItem(this.tableClass, {
            [this.metadata.hash.name]: hashKey,
        }, options);
    }
    async get(hashKey, options = { consistent: false }) {
        const dynamoRecord = await this.tableClass.metadata.connection.documentClient.get({
            TableName: this.tableClass.metadata.name,
            Key: {
                [this.metadata.hash.name]: hashKey,
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
    async batchGet(keys) {
        const res = await batch_get_1.batchGetTrim(this.tableClass.metadata.connection.documentClient, this.tableClass.metadata.name, keys.map((key) => {
            return {
                [this.metadata.hash.name]: key,
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
                [this.metadata.hash.name]: key,
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
                        [this.metadata.hash.name]: key,
                    },
                },
            };
        }));
    }
    async update(hashKey, changes, options = {}) {
        const update = transformers_1.buildUpdate(this.tableClass.metadata, changes);
        const condition = transformers_1.buildCondition(this.tableClass.metadata, options.condition);
        const updateInput = {
            TableName: this.tableClass.metadata.name,
            Key: {
                [this.metadata.hash.name]: hashKey,
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
            });
            await this.tableClass.metadata.connection.documentClient.transactWrite({
                TransactItems: [{
                        Update: updateInput
                    },
                    ...updates]
            }).promise();
        }
    }
}
exports.HashPrimaryKey = HashPrimaryKey;
//# sourceMappingURL=hash_primary_key.js.map