"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetadata = exports.createMetadata = exports.isSingleTableKey = exports.isFullKey = void 0;
// Table consists of
// - Attributes
// - Indexes
exports.isFullKey = (key) => {
    return key.range !== undefined;
};
exports.isSingleTableKey = (key) => {
    return key.classKeys !== undefined;
};
function createMetadata() {
    return {
        name: "",
        attributes: [],
        globalSecondaryIndexes: [],
        localSecondaryIndexes: [],
        relationshipKeys: []
    };
}
exports.createMetadata = createMetadata;
function validateMetadata(metadata) {
    if (!metadata.name) {
        throw new Error("Name must be provided for Table");
    }
    if (!metadata.primaryKey) {
        throw new Error("Table must have PrimaryKey");
    }
    if (!metadata.connection) {
        throw new Error("Table must have DynamoDB Connection");
    }
    if (exports.isSingleTableKey(metadata.primaryKey)) {
        metadata.uniqueKeys.forEach((key) => key.sortKeyName = 'classKey');
        // Add classname to attributes
        metadata.attributes.forEach((attribute) => {
            if (metadata.primaryKey.hash.name === attribute.name) {
                return;
            }
            attribute.name = `${metadata.className}_${attribute.name}`;
        });
    }
    // TTL
    const ttlAttributes = metadata.attributes.filter((attribute) => attribute.timeToLive);
    if (ttlAttributes.length > 1) {
        throw new Error("TTL attribute must be one");
    }
    else if (ttlAttributes.length === 1) {
        const ttlAttribute = ttlAttributes[0];
        if (ttlAttribute.type !== "N" /* Number */) {
            throw new Error("TTL Attribute must be type of Number, with value of unix timestamp such as 1460232057");
        }
    }
    else {
        // no TTL Attribute, pass
    }
}
exports.validateMetadata = validateMetadata;
//# sourceMappingURL=table.js.map