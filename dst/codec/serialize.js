"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUniqueKeyset = exports.serialize = void 0;
function serialize(tableClass, record) {
    const res = {};
    tableClass.metadata.attributes.forEach((attributeMetadata) => {
        const attr = record.getAttribute(attributeMetadata.name);
        if (attr !== undefined) {
            res[attributeMetadata.name] = attr;
        }
    });
    return res;
}
exports.serialize = serialize;
function serializeUniqueKeyset(tableClass, record, uniqueKeys) {
    const values = {};
    tableClass.metadata.attributes
        .filter((attributeMetadata) => {
        return uniqueKeys.includes(attributeMetadata.name);
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
//# sourceMappingURL=serialize.js.map