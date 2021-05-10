"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOneRelation = void 0;
const __1 = require("..");
const serialize_1 = require("../codec/serialize");
const transformers_1 = require("./expressions/transformers");
class OneToOneRelation {
    constructor(sideOne, sideTwo) {
        const metadata1 = sideOne.referenceTable.metadata.attributes.find(attr => attr.propertyName === sideOne.referenceField);
        const metadata2 = sideTwo.referenceTable.metadata.attributes.find(attr => attr.propertyName === sideTwo.referenceField);
        if (!metadata1) {
            throw new Error(`Cannot find field ${sideOne.referenceField}`);
        }
        if (!metadata2) {
            throw new Error(`Cannot find field ${sideTwo.referenceField}`);
        }
        this.sideOne = {
            copyToRelationTable: sideOne.copyToRelationTable,
            referenceField: metadata1,
            referenceTable: sideOne.referenceTable
        };
        this.sideTwo = {
            copyToRelationTable: sideTwo.copyToRelationTable,
            referenceField: metadata2,
            referenceTable: sideTwo.referenceTable
        };
    }
    tableInRelation(tableClass) {
        return this.sideTwo.referenceTable.name === tableClass.name || this.sideTwo.referenceTable.name === tableClass.name;
    }
    generatePutCopyInput(tableClass, record, options = {}) {
        if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
            return [];
        }
        const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
        const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
        if (!sourceRelation.copyToRelationTable) {
            return [];
        }
        const toPut = __1.Codec.serialize(tableClass, record, record.getAttribute(sourceRelation.referenceField.name));
        const copyItem = {
            Put: {
                TableName: targetRelation.referenceTable.metadata.name,
                Item: toPut,
                ConditionExpression: `attribute_not_exists(#id) AND attribute_not_exists(#classKey)`,
                ExpressionAttributeNames: {
                    '#id': targetRelation.referenceTable.metadata.primaryKey.hash.name,
                    '#classKey': 'classKey'
                },
            }
        };
        return [copyItem];
    }
    generatePutRelationInput(tableClass, record, options = {}) {
        if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
            return [];
        }
        const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
        const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
        if (!record.getAttribute(sourceRelation.referenceField.name)) {
            return [];
        }
        const updateClassKey = serialize_1.serializeClassKeys(targetRelation.referenceTable, record.serialize(), {
            [targetRelation.referenceTable.metadata.primaryKey.hash.name]: sourceRelation.referenceField
        });
        const updateTargetId = {
            Update: {
                TableName: targetRelation.referenceTable.metadata.name,
                Key: {
                    [targetRelation.referenceTable.metadata.primaryKey.hash.name]: record.getAttribute(sourceRelation.referenceField.name),
                    classKey: updateClassKey
                },
                ConditionExpression: `attribute_exists(#id) AND attribute_exists(#classKey)`,
                UpdateExpression: `SET #ref = :refId`,
                ExpressionAttributeNames: {
                    '#id': 'id',
                    '#classKey': 'classKey',
                    '#ref': targetRelation.referenceField.name
                },
                ExpressionAttributeValues: {
                    ':refId': record.getAttribute(targetRelation.referenceTable.metadata.primaryKey.hash.name)
                },
            }
        };
        return [updateTargetId];
    }
    async generateDeleteInputs(tableClass, keys, relationKey, options = {}) {
        if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
            return [];
        }
        const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
        const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
        const referenceKey = await tableClass.metadata.connection.documentClient.get({
            TableName: sourceRelation.referenceTable.metadata.name,
            Key: keys,
        }).promise();
        if (!referenceKey.Item || !referenceKey.Item[sourceRelation.referenceField.name]) {
            return [];
        }
        const updateClassKey = serialize_1.serializeClassKeys(targetRelation.referenceTable, referenceKey.Item, {
            [targetRelation.referenceTable.metadata.primaryKey.hash.name]: sourceRelation.referenceField
        });
        const removeTargetId = {
            Update: {
                TableName: targetRelation.referenceTable.metadata.name,
                Key: {
                    [targetRelation.referenceTable.metadata.primaryKey.hash.name]: referenceKey.Item[sourceRelation.referenceField.name],
                    classKey: updateClassKey
                },
                UpdateExpression: `REMOVE #${targetRelation.referenceField.name}`,
                ExpressionAttributeNames: {
                    [`#${targetRelation.referenceField.name}`]: targetRelation.referenceField.name,
                },
            }
        };
        if (!sourceRelation.copyToRelationTable) {
            return [removeTargetId];
        }
        const deleteCopy = {
            Delete: Object.assign({ TableName: targetRelation.referenceTable.metadata.name, Key: {
                    id: referenceKey.Item[sourceRelation.referenceField.name],
                    classKey: relationKey
                } }, transformers_1.buildCondition(tableClass.metadata, options.condition))
        };
        return [deleteCopy, removeTargetId];
    }
    async generateUpdateInputs(tableClass, hashKey, classKey) {
        if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
            return [];
        }
        const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
        if (!sourceRelation.copyToRelationTable) {
            return [];
        }
        const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
        const referenceKey = await tableClass.metadata.connection.documentClient.get({
            TableName: sourceRelation.referenceTable.metadata.name,
            Key: {
                id: hashKey,
                classKey
            },
            ProjectionExpression: sourceRelation.referenceField.name,
        }).promise();
        if (!referenceKey.Item || !referenceKey.Item[sourceRelation.referenceField.name]) {
            return [];
        }
        return [{
                tableName: targetRelation.referenceTable.metadata.name, id: referenceKey.Item.id
            }];
    }
}
exports.OneToOneRelation = OneToOneRelation;
//# sourceMappingURL=relationship_key.js.map