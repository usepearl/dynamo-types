"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCondition = void 0;
function parseCondition(condition, rangeKeyName) {
    switch (condition[0]) {
        case "=":
        case "<":
        case "<=":
        case ">":
        case ">=":
            return {
                conditionExpression: `${rangeKeyName} ${condition[0]} :rkv`,
                expressionAttributeValues: {
                    ":rkv": condition[1],
                },
            };
        case "beginsWith":
            return {
                conditionExpression: `begins_with(${rangeKeyName}, :rkv)`,
                expressionAttributeValues: {
                    ":rkv": condition[1],
                },
            };
        case "between":
            return {
                conditionExpression: `${rangeKeyName} between :rkv1 AND :rkv2`,
                expressionAttributeValues: {
                    ":rkv1": condition[1],
                    ":rkv2": condition[2],
                },
            };
    }
}
exports.parseCondition = parseCondition;
//# sourceMappingURL=query.js.map