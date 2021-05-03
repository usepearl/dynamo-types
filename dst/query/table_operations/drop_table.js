"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTable = void 0;
async function dropTable(metadata) {
    const res = await metadata.connection.client.deleteTable({ TableName: metadata.name }).promise();
    return res.TableDescription;
}
exports.dropTable = dropTable;
//# sourceMappingURL=drop_table.js.map