"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var table_1 = require("./table");
Object.defineProperty(exports, "Table", { enumerable: true, get: function () { return table_1.Table; } });
var attribute_1 = require("./attribute");
Object.defineProperty(exports, "Attribute", { enumerable: true, get: function () { return attribute_1.Attribute; } });
var global_secondary_index_1 = require("./global_secondary_index");
Object.defineProperty(exports, "FullGlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.FullGlobalSecondaryIndex; } });
Object.defineProperty(exports, "HashGlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.HashGlobalSecondaryIndex; } });
var local_secondary_index_1 = require("./local_secondary_index");
Object.defineProperty(exports, "LocalSecondaryIndex", { enumerable: true, get: function () { return local_secondary_index_1.LocalSecondaryIndex; } });
var full_primary_key_1 = require("./full_primary_key");
Object.defineProperty(exports, "FullPrimaryKey", { enumerable: true, get: function () { return full_primary_key_1.FullPrimaryKey; } });
var hash_primary_key_1 = require("./hash_primary_key");
Object.defineProperty(exports, "HashPrimaryKey", { enumerable: true, get: function () { return hash_primary_key_1.HashPrimaryKey; } });
// Helpers
var writer_1 = require("./writer");
Object.defineProperty(exports, "Writer", { enumerable: true, get: function () { return writer_1.Writer; } });
//# sourceMappingURL=index.js.map