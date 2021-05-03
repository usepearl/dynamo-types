"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const _ = require("lodash");
// It extracts value with type, such as 'S"
function parse(v) {
    if (v.B !== undefined) {
        // Buffer|Uint8Array|Blob|string;
        if (typeof v.B !== "string") {
            throw new Error("DynamoTypes doesn't support B attribute that is not string");
        }
        return { value: v.B, type: "B" /* Buffer */ };
    }
    else if (v.BOOL !== undefined) {
        return { value: v.BOOL, type: "BOOL" /* Boolean */ };
    }
    else if (v.L !== undefined) {
        const list = v.L.map((i) => parse(i).value);
        return { value: list, type: "L" /* Array */ };
    }
    else if (v.M !== undefined) {
        const map = _.mapValues(v.M, (i) => parse(i).value);
        return { value: map, type: "M" /* Map */ };
    }
    else if (v.N !== undefined) {
        return { value: Number(v.N), type: "N" /* Number */ };
    }
    else if (v.S !== undefined) {
        return { value: v.S, type: "S" /* String */ };
    }
    else if (v.NULL !== undefined) {
        return { value: null, type: "NULL" /* Null */ };
    }
    else {
        throw Error(`Can't parse value: ${JSON.stringify(v)}`);
    }
}
exports.parse = parse;
//# sourceMappingURL=attribute_value.js.map