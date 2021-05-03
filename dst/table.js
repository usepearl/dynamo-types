"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const _ = require("lodash");
const Metadata = require("./metadata");
const Query = require("./query");
class Table {
    constructor() {
        // raw storage for all attributes this record (instance) has
        this.__attributes = {}; // tslint:disable-line
    }
    // This will be setted by Decorator
    static get metadata() {
        if (!this.__metadata) {
            this.__metadata = Metadata.Table.createMetadata();
        }
        return this.__metadata;
    }
    static set metadata(metadata) {
        this.__metadata = metadata;
    }
    // Table Operations
    static async createTable() {
        await Query.TableOperations.createTable(this.metadata);
    }
    static async dropTable() {
        await Query.TableOperations.dropTable(this.metadata);
    }
    getAttribute(name) {
        return this.__attributes[name];
    }
    // Those are pretty much "Private". don't use it if its possible
    setAttribute(name, value) {
        // Do validation with Attribute metadata maybe
        this.__attributes[name] = value;
    }
    setAttributes(attributes) {
        _.forEach(attributes, (value, name) => {
            this.setAttribute(name, value);
        });
    }
    get writer() {
        if (!this.__writer) {
            this.__writer = new Query.Writer(this.constructor);
        }
        return this.__writer;
    }
    async save(options) {
        return await this.writer.put(this, options);
    }
    async delete(options) {
        return await this.writer.delete(this, options);
    }
    serialize() {
        // TODO some serialization logic
        return this.__attributes;
    }
}
exports.Table = Table;
//# sourceMappingURL=table.js.map