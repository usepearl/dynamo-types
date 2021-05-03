"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCondition = void 0;
const CONDITION_NAME_REF_PREFIX = "#ck";
const CONDITION_VALUE_REF_PREFIX = ":cv";
function buildCondition(metadata, condition = []) {
    const conditions = Array.isArray(condition) ? condition : [condition];
    if (conditions.length === 0) {
        return {};
    }
    const conditionExpressions = [];
    const keyRef = new Map();
    const valueRef = new Map();
    const keyNameCache = new Map(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));
    for (const cond of conditions) {
        const operatorExpressions = [];
        for (const [key, op] of Object.entries(cond)) {
            const name = keyNameCache.get(key);
            if (name) {
                const keyPath = `${CONDITION_NAME_REF_PREFIX}${keyRef.size}`;
                keyRef.set(keyPath, name);
                if (op.useValue) {
                    const values = Array.isArray(op.value) ? op.value : [op.value];
                    const valuePaths = values.map((value) => {
                        const valuePath = `${CONDITION_VALUE_REF_PREFIX}${valueRef.size}`;
                        valueRef.set(valuePath, value);
                        return valuePath;
                    });
                    operatorExpressions.push(op.toExpression(keyPath, valuePaths));
                }
                else {
                    operatorExpressions.push(op.toExpression(keyPath, []));
                }
            }
        }
        conditionExpressions.push(operatorExpressions.join(" AND "));
    }
    return {
        ConditionExpression: conditionExpressions.map((expr) => `( ${expr} )`).join(" OR "),
        ExpressionAttributeNames: keyRef.size > 0 ?
            Array.from(keyRef.entries()).reduce((hash, [key, val]) => (Object.assign(Object.assign({}, hash), { [key]: val })), {}) :
            undefined,
        ExpressionAttributeValues: valueRef.size > 0 ?
            Array.from(valueRef.entries()).reduce((hash, [key, val]) => (Object.assign(Object.assign({}, hash), { [key]: val })), {}) :
            undefined,
    };
}
exports.buildCondition = buildCondition;
//# sourceMappingURL=condition.js.map