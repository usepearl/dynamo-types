"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchPut = exports.put = exports.convertToUniquePutInputs = void 0;
const Codec = require("../codec");
const transformers_1 = require("./expressions/transformers");
const batch_write_1 = require("./batch_write");
exports.convertToUniquePutInputs = (tableClass, record, filterKey) => {
    const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
    if (!hasUniqueKeys) {
        return [];
    }
    else {
        const keyInputs = tableClass.metadata.uniqueKeys
            .filter((key) => {
            if (!filterKey) {
                return true;
            }
            return key === filterKey;
        })
            .map((key) => {
            var _a;
            const keyValue = `${key.name.toUpperCase()}#${Codec.serializeUniqueKeyset(tableClass, record, key.keys)}`;
            const item = key.sortKeyName ? {
                [key.primaryKeyName]: keyValue,
                [key.sortKeyName]: keyValue
            } : {
                [key.primaryKeyName]: keyValue
            };
            return {
                TableName: (_a = key.keyTableName) !== null && _a !== void 0 ? _a : tableClass.metadata.name,
                Item: item,
                ConditionExpression: `attribute_not_exists(${key.primaryKeyName})`
            };
        });
        return keyInputs;
    }
};
async function put(tableClass, record, options = {}) {
    const recordInput = Object.assign({ Item: Codec.serialize(tableClass, record), TableName: tableClass.metadata.name }, transformers_1.buildCondition(tableClass.metadata, options.condition));
    const inputs = exports.convertToUniquePutInputs(tableClass, record);
    if (inputs.length === 0) {
        const res = await tableClass.metadata.connection.documentClient.put(recordInput).promise();
        record.setAttributes(res.Attributes || {});
        return record;
    }
    else {
        await tableClass.metadata.connection.documentClient.transactWrite({
            TransactItems: [recordInput, ...inputs].map((params) => {
                return {
                    Put: params
                };
            })
        }).promise();
        return record;
    }
}
exports.put = put;
async function batchPut(tableClass, records) {
    const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
    if (hasUniqueKeys) {
        for (const record of records) {
            await put(tableClass, record);
        }
    }
    else {
        await batch_write_1.batchWrite(tableClass.metadata.connection.documentClient, tableClass.metadata.name, records.map((record) => {
            return {
                PutRequest: {
                    Item: Codec.serialize(tableClass, record)
                }
            };
        }));
    }
}
exports.batchPut = batchPut;
//# sourceMappingURL=put.js.map