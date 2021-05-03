"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchWrite = void 0;
const _ = require("lodash");
// this is limit of dynamoDB
const MAX_ITEMS = 25;
async function batchWrite(documentClient, tableName, requests) {
    try {
        await Promise.all(_.chunk(requests, MAX_ITEMS)
            .map(async (chunk) => {
            const res = await documentClient.batchWrite({
                RequestItems: {
                    [tableName]: chunk,
                },
            }).promise();
            return res;
        }));
    }
    catch (e) {
        // tslint:disable-next-line
        console.log(`Dynamo-Types batchWrite - ${JSON.stringify(requests, null, 2)}`);
        throw e;
    }
}
exports.batchWrite = batchWrite;
//# sourceMappingURL=batch_write.js.map