"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchPut = exports.put = exports.convertToUniquePutInputs = void 0;
const Codec = require("../codec");
const conditions_1 = require("./expressions/conditions");
const transformers_1 = require("./expressions/transformers");
const batch_write_1 = require("./batch_write");
const table_1 = require("../metadata/table");
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
            const keyValue = `${tableClass.metadata.className}_${key.name.toUpperCase()}#${Codec.serializeUniqueKeyset(tableClass, record, key.keys)}`;
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
    const conditions = options.condition === undefined ? [] : Array.isArray(options.condition) ? options.condition : [options.condition];
    const keyCondition = table_1.isSingleTableKey(tableClass.metadata.primaryKey) ? {
        [tableClass.metadata.primaryKey.hash.name]: conditions_1.AttributeNotExists(),
        classKey: conditions_1.AttributeNotExists()
    } : {
        [tableClass.metadata.primaryKey.hash.name]: conditions_1.AttributeNotExists(),
    };
    const condition = transformers_1.buildCondition(tableClass.metadata, [...conditions, keyCondition]);
    const recordInput = Object.assign({ Item: Codec.serialize(tableClass, record), TableName: tableClass.metadata.name }, condition);
    const inputs = exports.convertToUniquePutInputs(tableClass, record);
    const items = [recordInput, ...inputs].map((params) => {
        return {
            Put: params
        };
    });
    const relationshipInputs = tableClass.metadata.relationshipKeys
        .reduce((toRet, relation) => {
        const inputs = relation.generatePutRelationInput(tableClass, record, options);
        inputs.forEach((input) => toRet.push(input));
        return toRet;
    }, []);
    const copyInputs = tableClass.metadata.relationshipKeys
        .reduce((toRet, relation) => {
        const inputs = relation.generatePutCopyInput(tableClass, record, options);
        inputs.forEach((input) => {
            if (!toRet.find((i) => { var _a, _b; return ((_a = i.Put) === null || _a === void 0 ? void 0 : _a.TableName) === ((_b = input.Put) === null || _b === void 0 ? void 0 : _b.TableName); })) {
                toRet.push(input);
            }
        });
        return toRet;
    }, []);
    console.log("PUT", JSON.stringify([...items, ...copyInputs, ...relationshipInputs], null, 2));
    await tableClass.metadata.connection.documentClient.transactWrite({
        TransactItems: [...items, ...copyInputs, ...relationshipInputs]
    }).promise();
    return record;
}
exports.put = put;
async function batchPut(tableClass, records) {
    const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
    if (hasUniqueKeys || tableClass.metadata.relationshipKeys.length > 0) {
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