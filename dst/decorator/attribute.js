"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
require("reflect-metadata");
// Table Decorator
function Attribute(options = {}) {
    return (record, propertyName) => {
        const tableClass = record.constructor;
        const nativeType = Reflect.getMetadata("design:type", record, propertyName);
        tableClass.metadata.attributes.push({
            name: options.name || propertyName,
            propertyName,
            timeToLive: options.timeToLive,
            type: _nativeTypeToAttributeMetadataType(nativeType),
        });
    };
}
exports.Attribute = Attribute;
function _nativeTypeToAttributeMetadataType(nativeType) {
    if (nativeType === String) {
        return "S" /* String */;
    }
    else if (nativeType === Number) {
        return "N" /* Number */;
    }
    else if (nativeType === Boolean) {
        return "BOOL" /* Boolean */;
    }
    else if (nativeType === Array) {
        return "L" /* Array */;
    }
    else {
        return "M" /* Map */;
    }
}
//# sourceMappingURL=attribute.js.map