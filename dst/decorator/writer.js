"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const Query = require("../query");
// Writer is pretty much "Helper" method.
// You can still create writer without this decorator,
// but it seems pretty clear people would need writer for most of classes anyway
function Writer() {
    return (tableClass, propertyKey) => {
        Object.defineProperty(tableClass, propertyKey, {
            value: new Query.Writer(tableClass),
            writable: false,
        });
    };
}
exports.Writer = Writer;
//# sourceMappingURL=writer.js.map