"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleTableKey = void 0;
const Codec = require("../codec");
const serialize_1 = require("../codec/serialize");
const delete_1 = require("./delete");
const conditions_1 = require("./expressions/conditions");
const transformers_1 = require("./expressions/transformers");
class SingleTableKey {
    constructor(tableClass, metadata) {
        this.tableClass = tableClass;
        this.metadata = metadata;
    }
    async delete(hashKey, classKeys = {}, options = {}) {
        classKeys[this.metadata.hash.name] = hashKey;
        this.metadata.classKeys.forEach((key) => {
            if (classKeys[key.propertyName] === undefined && classKeys[key.name] === undefined) {
                throw new Error(`Cannot delete because missing value for ${key.propertyName}. Got: ${JSON.stringify(classKeys, null, 2)}`);
            }
            classKeys[key.name] = classKeys[key.propertyName];
        });
        const classKey = serialize_1.serializeClassKeys(this.tableClass, classKeys);
        const relationKey = serialize_1.serializeClassKeys(this.tableClass, classKeys);
        return delete_1.deleteItem(this.tableClass, {
            [this.metadata.hash.name]: hashKey,
            classKey
        }, Object.assign(Object.assign({}, options), { relationKey }));
    }
    async get(hashKey, classKeys, options = { consistent: false }) {
        const classValue = classKeys || {
            [this.metadata.hash.name]: hashKey
        };
        this.metadata.classKeys.forEach((key) => {
            if (classValue[key.propertyName] === undefined && classValue[key.name] === undefined) {
                throw new Error(`Cannot get because the classKey is required for: ${key.propertyName}. Got: ${JSON.stringify(classValue, null, 2)}`);
            }
            classValue[key.name] = classValue[key.propertyName];
        });
        const hashClassKey = serialize_1.serializeClassKeys(this.tableClass, classValue);
        const dynamoRecord = await this.tableClass.metadata.connection.documentClient.get({
            TableName: this.tableClass.metadata.name,
            Key: {
                [this.metadata.hash.name]: hashKey,
                classKey: hashClassKey
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
    async query(hashKey, options = {}) {
        const ScanIndexForward = options.order === "ASC";
        const result = await this.tableClass.metadata.connection.documentClient.query({
            TableName: this.tableClass.metadata.name,
            KeyConditionExpression: `#hash = :hash AND begins_with(#classKey, :classKey)`,
            ExpressionAttributeNames: {
                '#hash': this.metadata.hash.name,
                '#classKey': 'classKey'
            },
            ExpressionAttributeValues: {
                ':hash': hashKey,
                ':classKey': this.tableClass.metadata.className
            },
            ScanIndexForward,
            ConsistentRead: options.consistent,
            Limit: options.limit,
            ExclusiveStartKey: options.exclusiveStartKey,
            ReturnConsumedCapacity: "TOTAL",
        }).promise();
        const getRecords = () => {
            if (this.metadata.singleType === "HASH") {
                if (!result.Items) {
                    return null;
                }
                return Codec.deserialize(this.tableClass, result.Items[0]);
            }
            if (!result.Items) {
                return [];
            }
            return result.Items.map(item => Codec.deserialize(this.tableClass, item));
        };
        return {
            records: getRecords(),
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
    async update(hashKey, classKeys = {}, changes, options = { condition: [] }) {
        classKeys[this.metadata.hash.name] = hashKey;
        this.metadata.classKeys.forEach((key) => {
            if (!classKeys[key.propertyName]) {
                throw new Error(`Cannot delete because missing value for ${key.propertyName}`);
            }
        });
        const classKey = serialize_1.serializeClassKeys(this.tableClass, classKeys);
        const update = transformers_1.buildUpdate(this.tableClass.metadata, changes);
        const conditions = options.condition === undefined ? [] : Array.isArray(options.condition) ? options.condition : [options.condition];
        const keyCondition = {
            [this.metadata.hash.name]: conditions_1.AttributeExists(),
            classKey: conditions_1.AttributeExists()
        };
        const condition = transformers_1.buildCondition(this.tableClass.metadata, [...conditions, keyCondition]);
        const input = {
            Update: {
                TableName: this.tableClass.name,
                Key: {
                    [this.metadata.hash.name]: hashKey,
                    classKey
                },
                UpdateExpression: update.UpdateExpression,
                ConditionExpression: condition.ConditionExpression,
                ExpressionAttributeNames: Object.assign(Object.assign({}, update.ExpressionAttributeNames), condition.ExpressionAttributeNames),
                ExpressionAttributeValues: Object.assign(Object.assign({}, update.ExpressionAttributeValues), condition.ExpressionAttributeValues),
            }
        };
        const relationshipPromises = await Promise.all(this.tableClass.metadata.relationshipKeys.map((relation) => relation.generateUpdateInputs(this.tableClass, hashKey, classKey)));
        const foundRelationships = relationshipPromises
            .reduce((toRet, inputs) => {
            inputs.forEach((input) => toRet.push(input));
            return toRet;
        }, []);
        const relationshipInputs = foundRelationships.map((relation) => {
            return {
                Update: {
                    TableName: relation.tableName,
                    Key: {
                        id: relation.id,
                        classKey
                    },
                    UpdateExpression: update.UpdateExpression,
                    ConditionExpression: condition.ConditionExpression,
                    ExpressionAttributeNames: Object.assign(Object.assign({}, update.ExpressionAttributeNames), condition.ExpressionAttributeNames),
                    ExpressionAttributeValues: Object.assign(Object.assign({}, update.ExpressionAttributeValues), condition.ExpressionAttributeValues),
                }
            };
        });
        if (this.tableClass.metadata.uniqueKeys.length === 0) {
            await this.tableClass.metadata.connection.documentClient.transactWrite({
                TransactItems: [input, ...relationshipInputs]
            }).promise();
        }
        else {
            const updates = await transformers_1.buildUniqueKeyUpdates(this.tableClass, changes, {
                [this.metadata.hash.name]: hashKey,
                classKey
            });
            await this.tableClass.metadata.connection.documentClient.transactWrite({
                TransactItems: [
                    input,
                    ...relationshipInputs,
                    ...updates
                ]
            }).promise();
        }
    }
}
exports.SingleTableKey = SingleTableKey;
//# sourceMappingURL=single_table_key.js.map