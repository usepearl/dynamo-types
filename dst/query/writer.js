"use strict";
// Since in DyanmoDB writing is free from any kind index or what soever
// whole "writing" operations are bundled into one here
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const put_1 = require("./put");
const delete_1 = require("./delete");
class Writer {
    constructor(tableClass) {
        this.tableClass = tableClass;
    }
    async put(record, options = {}) {
        return put_1.put(this.tableClass, record, options);
    }
    async batchPut(records) {
        return put_1.batchPut(this.tableClass, records);
    }
    async delete(record, options = {}) {
        return delete_1.deleteItem(this.tableClass, KeyFromRecord(record, this.tableClass.metadata.primaryKey), options);
    }
}
exports.Writer = Writer;
function KeyFromRecord(record, metadata) {
    if (metadata.type === "HASH") {
        return {
            [metadata.hash.name]: record.getAttribute(metadata.hash.name),
        };
    }
    else {
        return {
            [metadata.hash.name]: record.getAttribute(metadata.hash.name),
            [metadata.range.name]: record.getAttribute(metadata.range.name),
        };
    }
}
//# sourceMappingURL=writer.js.map