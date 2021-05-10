"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeClassKeys = exports.serializeUniqueKeyset = exports.serialize = void 0;
const table_1 = require("../metadata/table");
function serialize(tableClass, record, withRelationId) {
    const res = {};
    tableClass.metadata.attributes.forEach((attributeMetadata) => {
        const attr = record.getAttribute(attributeMetadata.name);
        if (attr !== undefined) {
            res[attributeMetadata.name] = attr;
        }
    });
    if (table_1.isSingleTableKey(tableClass.metadata.primaryKey)) {
        const classKey = serializeClassKeys(tableClass, record.serialize(), !!withRelationId);
        res.classKey = classKey;
        if (!!withRelationId) {
            res.id = withRelationId;
        }
    }
    return res;
}
exports.serialize = serialize;
function serializeUniqueKeyset(tableClass, record, uniqueKeys) {
    const values = {};
    tableClass.metadata.attributes
        .filter((attributeMetadata) => {
        return uniqueKeys.includes(attributeMetadata.propertyName);
    })
        .forEach((attributeMetadata) => {
        const attr = record.getAttribute(attributeMetadata.name);
        if (attr !== undefined) {
            values[attributeMetadata.name] = attr.toString();
        }
    });
    return Object.values(values).join("_");
}
exports.serializeUniqueKeyset = serializeUniqueKeyset;
function serializeClassKeys(tableClass, record, forRelation) {
    if (!table_1.isSingleTableKey(tableClass.metadata.primaryKey)) {
        throw new Error("Cannot serialize class keys because table is not SingleTable");
    }
    const keys = tableClass.metadata.primaryKey.classKeys;
    // [ tableClass.metadata.primaryKey.hash, ...tableClass.metadata.primaryKey.classKeys ] 
    const values = keys.map((attribute) => {
        const value = record[attribute.name];
        if (value === undefined) {
            throw new Error(`Can't find ${attribute.propertyName}. Got: ${JSON.stringify(record, null, 2)}`);
        }
        return value.toString();
    });
    const valueStr = values.join("_");
    const keyStr = keys.map((attribute) => attribute.propertyName).join("_");
    return `${tableClass.metadata.className}_${keyStr}#${valueStr}`;
}
exports.serializeClassKeys = serializeClassKeys;
//# sourceMappingURL=serialize.js.map