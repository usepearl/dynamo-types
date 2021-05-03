"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUniqueKeyUpdates = exports.buildUpdate = void 0;
const _ = require("lodash");
const __1 = require("../../..");
const codec_1 = require("../../../codec");
const delete_1 = require("../../delete");
const put_1 = require("../../put");
const UPDATE_NAME_REF_PREFIX = "#uk";
const UPDATE_VALUE_REF_PREFIX = ":uv";
const ACTION_TOKEN_MAP = new Map([
    ["PUT", "SET"],
    ["ADD", "ADD"],
    ["DELETE", "DELETE"],
]);
function buildUpdate(metadata, changes) {
    const keyRef = new Map();
    const valueRef = new Map();
    const keyNameCache = new Map(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));
    const expr = _(changes)
        .map((change, key) => ({ name: keyNameCache.get(key), action: change[0], value: change[1] }))
        .filter((change) => change.name !== undefined)
        .groupBy((change) => change.action)
        .map((groupedChanges, action) => {
        const actions = groupedChanges.map((change) => {
            const keyPath = `${UPDATE_NAME_REF_PREFIX}${keyRef.size}`;
            keyRef.set(keyPath, change.name);
            const valuePath = `${UPDATE_VALUE_REF_PREFIX}${valueRef.size}`;
            valueRef.set(valuePath, change.value);
            switch (action) {
                case "PUT":
                    return `${keyPath} = ${valuePath}`;
                case "ADD":
                case "DELETE":
                    return `${keyPath} ${valuePath}`;
            }
        });
        return `${ACTION_TOKEN_MAP.get(action)} ${actions.join(", ")}`;
    })
        .join(" ");
    return {
        UpdateExpression: expr,
        ExpressionAttributeNames: keyRef.size > 0 ?
            Array.from(keyRef.entries()).reduce((hash, [key, val]) => (Object.assign(Object.assign({}, hash), { [key]: val })), {}) :
            undefined,
        ExpressionAttributeValues: valueRef.size > 0 ?
            Array.from(valueRef.entries()).reduce((hash, [key, val]) => (Object.assign(Object.assign({}, hash), { [key]: val })), {}) :
            undefined,
    };
}
exports.buildUpdate = buildUpdate;
async function buildUniqueKeyUpdates(tableClass, changes, itemKeys) {
    const item = await tableClass.metadata.connection.documentClient.get({
        TableName: tableClass.metadata.name,
        Key: itemKeys,
        AttributesToGet: tableClass.metadata.uniqueKeyFieldList
    }).promise();
    const record = __1.Codec.deserialize(tableClass, item.Item, tableClass.metadata.uniqueKeyFieldList);
    const writeItems = {};
    _(changes)
        .flatMap((change, key) => {
        return tableClass.metadata.uniqueKeys.map((uniqueKey) => ({
            name: key, uniqueKey,
            action: change[0], value: change[1]
        }));
    })
        .filter((change) => !!change.uniqueKey)
        .groupBy((change) => change.action)
        .forEach((groupedChanges, action) => {
        groupedChanges.forEach((change) => {
            const deleteInputs = delete_1.convertToUniqueDeleteInputs(tableClass, record, change.uniqueKey);
            if (action === "PUT" || action === "ADD") {
                const recordCopy = codec_1.deserialize(tableClass, record.serialize());
                recordCopy.setAttribute(change.name, change.value);
                const putInputs = put_1.convertToUniquePutInputs(tableClass, recordCopy, change.uniqueKey);
                putInputs.forEach((pi) => {
                    const writeKey = Object.values(pi.Item)[0];
                    if (!writeItems[writeKey]) {
                        writeItems[writeKey] = {
                            Put: pi
                        };
                    }
                });
            }
            if (action === "PUT" || action === "DELETE") {
                deleteInputs.forEach((di) => {
                    const writeKey = Object.values(di.Key)[0];
                    if (!writeItems[writeKey]) {
                        writeItems[writeKey] = {
                            Delete: di
                        };
                    }
                });
            }
        });
    });
    const unsorted = Object.values(writeItems);
    const sorted = unsorted.sort((a, b) => a.Delete ? -1 : (b.Delete ? -1 : 1));
    return sorted;
}
exports.buildUniqueKeyUpdates = buildUniqueKeyUpdates;
//# sourceMappingURL=update.js.map