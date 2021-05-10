"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.convertToUniqueDeleteInputs = void 0;
const __1 = require("..");
const transformers_1 = require("./expressions/transformers");
function convertToUniqueDeleteInputs(tableClass, record, filterKey) {
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
            const keyValue = `${tableClass.metadata.className}_${key.name.toUpperCase()}#${__1.Codec.serializeUniqueKeyset(tableClass, record, key.keys)}`;
            const item = key.sortKeyName ? {
                [key.primaryKeyName]: keyValue,
                [key.sortKeyName]: keyValue
            } : {
                [key.primaryKeyName]: keyValue
            };
            return {
                TableName: (_a = key.keyTableName) !== null && _a !== void 0 ? _a : tableClass.metadata.name,
                Key: item
            };
        });
        return keyInputs;
    }
}
exports.convertToUniqueDeleteInputs = convertToUniqueDeleteInputs;
async function deleteItem(tableClass, keys, options = {}) {
    const recordInput = {
        Delete: Object.assign({ TableName: tableClass.metadata.name, Key: keys }, transformers_1.buildCondition(tableClass.metadata, options.condition))
    };
    const relationshipPromises = await Promise.all(tableClass.metadata.relationshipKeys.map((relation) => relation.generateDeleteInputs(tableClass, keys, options.relationKey, options)));
    const relationshipInputs = relationshipPromises
        .reduce((toRet, inputs) => {
        inputs.forEach((input) => toRet.push(input));
        return toRet;
    }, []);
    const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
    if (!hasUniqueKeys) {
        await tableClass.metadata.connection.documentClient.transactWrite({
            TransactItems: [recordInput, ...relationshipInputs]
        }).promise();
    }
    else {
        const item = await tableClass.metadata.connection.documentClient.get({
            TableName: tableClass.metadata.name,
            Key: keys,
            AttributesToGet: tableClass.metadata.uniqueKeyFieldList
        }).promise();
        if (!item.Item) {
            return;
        }
        const record = __1.Codec.deserialize(tableClass, item.Item, tableClass.metadata.uniqueKeyFieldList);
        const keyInputs = convertToUniqueDeleteInputs(tableClass, record).map((params) => {
            return {
                Delete: params
            };
        });
        console.log("DELETING", JSON.stringify([recordInput, ...relationshipInputs, ...keyInputs], null, 2));
        await tableClass.metadata.connection.documentClient.transactWrite({
            TransactItems: [recordInput, ...relationshipInputs, ...keyInputs]
        }).promise();
    }
}
exports.deleteItem = deleteItem;
//# sourceMappingURL=delete.js.map