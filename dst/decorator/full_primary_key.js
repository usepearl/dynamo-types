"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullPrimaryKey = void 0;
function FullPrimaryKey(hashKeyName, rangeKeyName) {
    return (tableClass, propertyKey) => {
        const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
        if (!hash) {
            throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
        }
        const range = tableClass.metadata.attributes.find((attr) => attr.name === rangeKeyName);
        if (!range) {
            throw new Error(`Given hashKey ${rangeKeyName} is not declared as attribute`);
        }
        tableClass.metadata.primaryKey = {
            type: "FULL",
            hash,
            name: propertyKey,
            range,
        };
    };
}
exports.FullPrimaryKey = FullPrimaryKey;
//# sourceMappingURL=full_primary_key.js.map