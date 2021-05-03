"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashPrimaryKey = void 0;
function HashPrimaryKey(hashKeyName) {
    return (tableClass, propertyKey) => {
        const hash = tableClass.metadata.attributes.find((attr) => attr.name === hashKeyName);
        if (!hash) {
            throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
        }
        tableClass.metadata.primaryKey = {
            type: "HASH",
            hash,
            name: propertyKey,
        };
    };
}
exports.HashPrimaryKey = HashPrimaryKey;
//# sourceMappingURL=hash_primary_key.js.map