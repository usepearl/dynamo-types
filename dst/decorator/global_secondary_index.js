"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashGlobalSecondaryIndex = exports.FullGlobalSecondaryIndex = void 0;
function FullGlobalSecondaryIndex(hashKeyName, rangeKeyName, options = {}) {
    return (tableClass, propertyName) => {
        const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
        if (!hash) {
            throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
        }
        const range = tableClass.metadata.attributes.find((attr) => attr.name === rangeKeyName);
        if (!range) {
            throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);
        }
        tableClass.metadata.globalSecondaryIndexes.push({
            type: "FULL",
            name: options.name || propertyName,
            propertyName,
            hash,
            range,
        });
    };
}
exports.FullGlobalSecondaryIndex = FullGlobalSecondaryIndex;
function HashGlobalSecondaryIndex(hashKeyName, options = {}) {
    return (tableClass, propertyName) => {
        const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
        if (!hash) {
            throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
        }
        tableClass.metadata.globalSecondaryIndexes.push({
            type: "HASH",
            name: options.name || propertyName,
            propertyName,
            hash,
        });
    };
}
exports.HashGlobalSecondaryIndex = HashGlobalSecondaryIndex;
//# sourceMappingURL=global_secondary_index.js.map