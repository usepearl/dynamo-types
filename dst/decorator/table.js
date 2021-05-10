"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const Metadata = require("../metadata");
const Query = require("../query");
const config_1 = require("../config");
const table_1 = require("../metadata/table");
// Table Decorator
function Table(options) {
    return (target) => {
        target.metadata.connection = options.connection || config_1.default.defaultConnection;
        target.metadata.className = options.className || target.name;
        target.metadata.name = options.tableName;
        target.metadata.uniqueKeys = options.uniqueKeys || [];
        target.metadata.uniqueKeyFieldList = [];
        target.metadata.uniqueKeys.forEach((key) => {
            key.keys.forEach((keyField) => {
                const attr = target.metadata.attributes.find((attr) => attr.propertyName === keyField);
                let realKey = `${target.metadata.className}_${attr.name}`;
                if (target.metadata.primaryKey.hash.name === attr.name) {
                    realKey = attr.name;
                }
                if (table_1.isFullKey(target.metadata.primaryKey) && target.metadata.primaryKey.range.name === attr.name) {
                    realKey = attr.name;
                }
                if (!target.metadata.uniqueKeyFieldList.includes(realKey)) {
                    target.metadata.uniqueKeyFieldList.push(realKey);
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
        else if (pkMetdata.type === "HASH") {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.HashPrimaryKey(table, pkMetdata),
                writable: false,
            });
        }
        else {
            Object.defineProperty(table, pkMetdata.name, {
                value: new Query.SingleTableKey(table, pkMetdata),
                writable: false,
            });
        }
    }
}
//# sourceMappingURL=table.js.map