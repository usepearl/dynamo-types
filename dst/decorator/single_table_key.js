"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleTableKey = void 0;
function SingleTableKey(hashKeyName, classKeys) {
    return (tableClass, propertyKey) => {
        const hash = tableClass.metadata.attributes.find((attr) => attr.propertyName === hashKeyName);
        if (!hash) {
            throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
        }
        const realClassKeys = classKeys || [hashKeyName];
        const classAttributes = realClassKeys.map((key) => {
            const attribute = tableClass.metadata.attributes.find((attr) => attr.propertyName === key);
            if (!attribute) {
                throw new Error(`Given classKey ${key} is not declared as attribute`);
            }
            return attribute;
        });
        tableClass.metadata.primaryKey = {
            type: "SINGLE_TABLE",
            hash,
            name: propertyKey,
            classKeys: classAttributes,
            singleType: classKeys ? "RANGE" : "HASH",
            isPrimaryTable: true
        };
    };
}
exports.SingleTableKey = SingleTableKey;
//# sourceMappingURL=single_table_key.js.map