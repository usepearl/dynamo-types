"use strict";
// TODO: Implement "Not" operator
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operator = void 0;
class Operator {
    // tslint:enable:variable-name
    constructor(type, value, useValue = true) {
        this._type = type;
        this._value = value;
        this._useValue = useValue;
    }
    get value() {
        return this._value instanceof Operator ?
            this._value.value :
            this._value;
    }
    get useValue() {
        return this._useValue;
    }
    toExpression(keyPath, valuePaths) {
        switch (this._type) {
            case "equal":
                return `${keyPath} = ${valuePaths[0]}`;
            case "notEqual":
                return `${keyPath} <> ${valuePaths[0]}`;
            case "lessThan":
                return `${keyPath} < ${valuePaths[0]}`;
            case "lessThanOrEqual":
                return `${keyPath} <= ${valuePaths[0]}`;
            case "greaterThan":
                return `${keyPath} > ${valuePaths[0]}`;
            case "greaterThanOrEqual":
                return `${keyPath} >= ${valuePaths[0]}`;
            case "between":
                return `${keyPath} BETWEEN ${valuePaths[0]} AND ${valuePaths[1]}`;
            case "in":
                return `${keyPath} IN (${valuePaths.map((path) => `${path}`).join(", ")})`;
            case "attributeExists":
                return `attribute_exists(${keyPath})`;
            case "attributeNotExists":
                return `attribute_not_exists(${keyPath})`;
            case "beginsWith":
                return `begins_with(${keyPath}, ${valuePaths[0]})`;
            case "contains":
                return `contains(${keyPath}, ${valuePaths[0]})`;
        }
    }
}
exports.Operator = Operator;
//# sourceMappingURL=operator.js.map