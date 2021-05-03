"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMetadata = exports.createMetadata = void 0;
function createMetadata() {
    return {
        name: "",
        attributes: [],
        globalSecondaryIndexes: [],
        localSecondaryIndexes: [],
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