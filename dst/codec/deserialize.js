"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmarshal = exports.deserialize = void 0;
const aws_sdk_1 = require("aws-sdk");
const _ = require("lodash");
function deserialize(tableClass, dynamoAttributes, filterKeys) {
    const record = new tableClass();
    tableClass.metadata.attributes
        .filter((attributeMetadata) => {
        if (!filterKeys) {
            return true;
        }
        return filterKeys.includes(attributeMetadata.name);
    })
        .forEach((attributeMetadata) => {
        const attributeValue = dynamoAttributes[attributeMetadata.name];
        if (!dynamoAttributes.hasOwnProperty(attributeMetadata.name)) {
            // attribute is defined but not provided by DynamoDB
            // raise error but maybe later?
            return;
        }
        else {
            record.setAttribute(attributeMetadata.name, attributeValue);
        }
    });
    return record;
}
exports.deserialize = deserialize;
function unmarshal(tableClass, dynamoAttributes) {
    const result = aws_sdk_1.DynamoDB.Converter.unmarshall(dynamoAttributes);
    _.map(result, (val, key) => {
        if (val !== null && typeof (val) === "object" && val.values && val.type) {
            result[key] = val.values;
        }
    });
    return deserialize(tableClass, result);
}
exports.unmarshal = unmarshal;
//# sourceMappingURL=deserialize.js.map