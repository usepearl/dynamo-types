"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contains = exports.BeginsWith = exports.AttributeNotExists = exports.AttributeExists = exports.In = exports.Between = exports.GreaterThanOrEqual = exports.GreaterThan = exports.LessThanOrEqual = exports.LessThan = exports.NotEqual = exports.Equal = void 0;
const operator_1 = require("./operator");
function Equal(value) {
    return new operator_1.Operator("equal", value);
}
exports.Equal = Equal;
function NotEqual(value) {
    return new operator_1.Operator("notEqual", value);
}
exports.NotEqual = NotEqual;
function LessThan(value) {
    return new operator_1.Operator("lessThan", value);
}
exports.LessThan = LessThan;
function LessThanOrEqual(value) {
    return new operator_1.Operator("lessThanOrEqual", value);
}
exports.LessThanOrEqual = LessThanOrEqual;
function GreaterThan(value) {
    return new operator_1.Operator("greaterThan", value);
}
exports.GreaterThan = GreaterThan;
function GreaterThanOrEqual(value) {
    return new operator_1.Operator("greaterThanOrEqual", value);
}
exports.GreaterThanOrEqual = GreaterThanOrEqual;
function Between(from, to) {
    return new operator_1.Operator("between", [from, to]);
}
exports.Between = Between;
function In(value) {
    return new operator_1.Operator("in", value);
}
exports.In = In;
function AttributeExists() {
    return new operator_1.Operator("attributeExists", undefined, false);
}
exports.AttributeExists = AttributeExists;
function AttributeNotExists() {
    return new operator_1.Operator("attributeNotExists", undefined, false);
}
exports.AttributeNotExists = AttributeNotExists;
function BeginsWith(value) {
    return new operator_1.Operator("beginsWith", value);
}
exports.BeginsWith = BeginsWith;
function Contains(value) {
    return new operator_1.Operator("contains", value);
}
exports.Contains = Contains;
//# sourceMappingURL=operators.js.map