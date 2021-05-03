"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalSecondaryIndex = void 0;
function LocalSecondaryIndex(rangeKeyName, options = {}) {
    return (tableClass, propertyName) => {
        const range = tableClass.metadata.attributes.find((attr) => attr.name === rangeKeyName);
        if (!range) {
            throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);
        }
        tableClass.metadata.localSecondaryIndexes.push({
            name: options.name || propertyName,
            propertyName,
            range,
        });
    };
}
exports.LocalSecondaryIndex = LocalSecondaryIndex;
//# sourceMappingURL=local_secondary_index.js.map