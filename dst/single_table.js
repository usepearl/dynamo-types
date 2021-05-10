"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleMetaTable = exports.SingleMetaTableResult = exports.SingleTable = void 0;
const _1 = require(".");
const table_1 = require("./metadata/table");
const table_2 = require("./table");
class SingleTable extends table_2.Table {
}
exports.SingleTable = SingleTable;
class SingleMetaTableResult {
    constructor(result, classRefs) {
        this.result = result;
        this.classRefs = classRefs;
    }
    extract(classRef) {
        var _a;
        if (classRef.metadata.primaryKey.singleType === 'HASH') {
            return this.result[classRef.metadata.className][0];
        }
        return (_a = this.result[classRef.metadata.className]) !== null && _a !== void 0 ? _a : [];
    }
}
exports.SingleMetaTableResult = SingleMetaTableResult;
class SingleMetaTable {
    constructor(...ref) {
        this.tablesRef = ref;
        this.rootRef = ref[0];
        if (!table_1.isSingleTableKey(this.rootRef.metadata.primaryKey)) {
            throw new Error("Meta tables only work when the primary key is single table");
        }
        ref.forEach((table) => {
            if (table.metadata.name !== this.rootRef.metadata.name) {
                throw new Error("Meta tables only work when all child tables are stored in the same table");
            }
            if (!table_1.isSingleTableKey(table.metadata.primaryKey)) {
                throw new Error("All child tables need to have the primary key as single table");
            }
        });
        this.key = this.rootRef.metadata.primaryKey;
    }
    async get(hashKey, options = { consistent: false }) {
        const items = await this.rootRef.metadata.connection.documentClient.query({
            TableName: this.rootRef.metadata.name,
            KeyConditionExpression: `#hash = :hash`,
            ConsistentRead: options.consistent,
            ExpressionAttributeNames: {
                "#hash": this.key.hash.name
            },
            ExpressionAttributeValues: {
                ":hash": hashKey
            }
        }).promise();
        if (!items.Items) {
            return new SingleMetaTableResult({}, []);
        }
        const values = {};
        const tables = [];
        items.Items.forEach(item => {
            const className = item.classKey.split('_')[0];
            const table = this.tablesRef.find((ref) => ref.metadata.className === className);
            if (!table) {
                return;
            }
            if (!tables.includes(table)) {
                tables.push(table);
            }
            if (!values[className]) {
                values[className] = [];
            }
            values[className].push(_1.Codec.deserialize(table, item));
        });
        return new SingleMetaTableResult(values, tables);
    }
    async query(hashKey, options = {}) {
        var _a;
        const ScanIndexForward = options.order === "ASC";
        const singleClass = () => {
            return [
                this.rootRef.metadata.connection.documentClient.query({
                    TableName: this.rootRef.metadata.name,
                    KeyConditionExpression: `#hash = :hash`,
                    ExpressionAttributeNames: {
                        '#hash': this.key.hash.name,
                    },
                    ExpressionAttributeValues: {
                        ':hash': hashKey,
                    },
                    ScanIndexForward,
                    ConsistentRead: options.consistent,
                    Limit: options.limit,
                    ExclusiveStartKey: options.exclusiveStartKey ? options.exclusiveStartKey['root'] : undefined,
                    ReturnConsumedCapacity: "TOTAL",
                })
                    .promise()
                    .then((res) => ({
                    result: res,
                    classType: this.rootRef
                }))
            ];
        };
        const multipleClasses = () => {
            return options.classes.map((classType) => this.rootRef.metadata.connection.documentClient.query({
                TableName: this.rootRef.metadata.name,
                KeyConditionExpression: `#hash = :hash AND begins_with(#classKey, :${classType.metadata.className})`,
                ExpressionAttributeNames: {
                    '#hash': this.key.hash.name,
                    '#classKey': 'classKey'
                },
                ExpressionAttributeValues: {
                    ':hash': hashKey,
                    [`:${classType.metadata.className}`]: classType.metadata.className
                },
                ScanIndexForward,
                ConsistentRead: options.consistent,
                Limit: options.limit,
                ExclusiveStartKey: options.exclusiveStartKey ? options.exclusiveStartKey[classType.metadata.className] : undefined,
                ReturnConsumedCapacity: "TOTAL",
            })
                .promise()
                .then((res) => ({
                result: res,
                classType
            })));
        };
        const promises = options.classes ? multipleClasses() : singleClass();
        const results = await Promise.all(promises);
        const values = {};
        const tables = [];
        const info = {};
        for (const result of results) {
            info[result.classType.metadata.className] = {
                consumedCapacity: result.result.ConsumedCapacity,
                count: result.result.Count,
                lastEvaluatedKey: result.result.LastEvaluatedKey,
                scannedCount: result.result.ScannedCount
            };
            (_a = result.result.Items) === null || _a === void 0 ? void 0 : _a.forEach(item => {
                const className = item.classKey.split('_')[0];
                const table = this.tablesRef.find((ref) => ref.metadata.className === className);
                if (!table) {
                    return;
                }
                if (!tables.includes(table)) {
                    tables.push(table);
                }
                if (!values[className]) {
                    values[className] = [];
                }
                values[className].push(_1.Codec.deserialize(table, item));
            });
        }
        return {
            records: new SingleMetaTableResult(values, tables),
            info
        };
    }
}
exports.SingleMetaTable = SingleMetaTable;
//# sourceMappingURL=single_table.js.map