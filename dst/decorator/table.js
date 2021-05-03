"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const Metadata = require("../metadata");
const Query = require("../query");
const config_1 = require("../config");
// Table Decorator
function Table(options = {}) {
    return (target) => {
        target.metadata.connection = options.connection || config_1.default.defaultConnection;
        target.metadata.name = options.name || target.name;
        target.metadata.uniqueKeys = options.uniqueKeys || [];
        target.metadata.uniqueKeyFieldList = [];
        target.metadata.uniqueKeys.forEach((key) => {
            key.keys.forEach((keyField) => {
                if (!target.metadata.uniqueKeyFieldList.includes(keyField)) {
                    target.metadata.uniqueKeyFieldList.push(keyField);
                }
            });
        });
        // Table Decorator Executed at last,
        // So Validate metadata, presume all the setups are finisehd
        Metadata.Table.validateMetadata(target.metadata);
        // After validation, setup some methods.
        defineAttributeProperties(target);
        definePrimaryKeyProperty(target);
        defineUniqueKeys(target);
        defineGlobalSecondaryIndexes(target);
        defineLocalSecondaryIndexes(target);
    };
}
exports.Table = Table;
function defineAttributeProperties(table) {
    table.metadata.attributes.forEach((attr) => {
        Object.defineProperty(table.prototype, attr.propertyName, {
            configurable: true,
            enumerable: true,
            get() {
                return this.getAttribute(attr.name);
            },
            set(v) {
                this.setAttribute(attr.name, v);
            },
        });
    });
}
function defineUniqueKeys(table) {
    table.metadata.uniqueKeys.forEach((key) => {
        Object.defineProperty(table.prototype, key.name, {
            configurable: true,
            enumerable: true,
            get() {
                return this.getAttribute(key.name);
            },
            set(v) {
                this.setAttribute(key.name, v);
            }
        });
    });
}
function defineGlobalSecondaryIndexes(table) {
    table.metadata.globalSecondaryIndexes.forEach((metadata) => {
        if (metadata.type === "HASH") {
            Object.defineProperty(table, metadata.propertyName, {
                value: new Query.HashGlobalSecondaryIndex(table, metadata),
                writable: false,
            });
        }
        else {
            Object.defineProperty(table, metadata.propertyName, {
                value: new Query.FullGlobalSecondaryIndex(table, metadata),
                writable: false,
            });
        }
    });
}
function defineLocalSecondaryIndexes(table) {
    table.metadata.localSecondaryIndexes.forEach((metadata) => {
        Object.defineProperty(table, metadata.propertyName, {
            value: new Query.LocalSecondaryIndex(table, metadata),
            writable: false,
        });
    });
}
function definePrimaryKeyProperty(table) {
    if (table.metadata.primaryKey) {
        const pkMetdata = table.metadata.primaryKey;
        if (pkMetdata.type === "FULL") {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.FullPrimaryKey(table, pkMetdata),
                writable: false,
            });
        }
        else {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.HashPrimaryKey(table, pkMetdata),
                writable: false,
            });
        }
    }
}
//# sourceMappingURL=table.js.map