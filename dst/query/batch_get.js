"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchGetTrim = exports.batchGetFull = exports.__batchGet = void 0;
const _ = require("lodash");
// this is limit of dynamoDB
const MAX_ITEMS = 100;
/**
 *
 * @param documentClient
 * @param tableName
 * @param keys
 * @param trimMissing - when given key doesn't have matching record,
 * return "undefined" for index? or just remove it (default is true)
 */
async function __batchGet(documentClient, tableName, keys) {
    try {
        return await Promise.all(_.chunk(keys, MAX_ITEMS)
            .map(async (chunkedKeys) => {
            const res = await documentClient.batchGet({
                RequestItems: {
                    [tableName]: {
                        Keys: chunkedKeys,
                    },
                },
            }).promise();
            const records = res.Responses[tableName];
            return chunkedKeys.map((key) => {
                return records.find((record) => {
                    for (const keyName of Object.keys(key)) {
                        if (record[keyName] !== key[keyName]) {
                            return false;
                        }
                    }
                    return true;
                });
            });
        })).then((chunks) => {
            return _.flatten(chunks);
        });
    }
    catch (e) {
        // tslint:disable-next-line
        console.log(`Dynamo-Types batchGet - ${JSON.stringify(keys, null, 2)}`);
        throw e;
    }
}
exports.__batchGet = __batchGet;
async function batchGetFull(documentClient, tableName, keys) {
    return await __batchGet(documentClient, tableName, keys);
}
exports.batchGetFull = batchGetFull;
async function batchGetTrim(documentClient, tableName, keys) {
    return removeFalsyFilter(await __batchGet(documentClient, tableName, keys));
}
exports.batchGetTrim = batchGetTrim;
function removeFalsyFilter(array) {
    const res = [];
    array.forEach((item) => {
        if (!!item) {
            res.push(item);
        }
    });
    return res;
}
//# sourceMappingURL=batch_get.js.map