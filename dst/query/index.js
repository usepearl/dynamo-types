"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableOperations = void 0;
var full_primary_key_1 = require("./full_primary_key");
Object.defineProperty(exports, "FullPrimaryKey", { enumerable: true, get: function () { return full_primary_key_1.FullPrimaryKey; } });
var hash_primary_key_1 = require("./hash_primary_key");
Object.defineProperty(exports, "HashPrimaryKey", { enumerable: true, get: function () { return hash_primary_key_1.HashPrimaryKey; } });
var single_table_key_1 = require("./single_table_key");
Object.defineProperty(exports, "SingleTableKey", { enumerable: true, get: function () { return single_table_key_1.SingleTableKey; } });
var global_secondary_index_1 = require("./global_secondary_index");
Object.defineProperty(exports, "FullGlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.FullGlobalSecondaryIndex; } });
Object.defineProperty(exports, "HashGlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.HashGlobalSecondaryIndex; } });
var local_secondary_index_1 = require("./local_secondary_index");
Object.defineProperty(exports, "LocalSecondaryIndex", { enumerable: true, get: function () { return local_secondary_index_1.LocalSecondaryIndex; } });
var writer_1 = require("./writer");
Object.defineProperty(exports, "Writer", { enumerable: true, get: function () { return writer_1.Writer; } });
const TableOperations = require("./table_operations");
exports.TableOperations = TableOperations;
__exportStar(require("./expressions/conditions"), exports);
__exportStar(require("./expressions/update"), exports);
//# sourceMappingURL=index.js.map