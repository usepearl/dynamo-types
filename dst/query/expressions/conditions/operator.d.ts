export declare type OperatorType = "equal" | "notEqual" | "lessThan" | "lessThanOrEqual" | "greaterThan" | "greaterThanOrEqual" | "between" | "in" | "attributeExists" | "attributeNotExists" | "beginsWith" | "contains";
export declare class Operator<T> {
    private readonly _type;
    private readonly _value;
    private readonly _useValue;
    constructor(type: OperatorType, value: T | Operator<T>, useValue?: boolean);
    get value(): T;
    get useValue(): boolean;
    toExpression(keyPath: string, valuePaths: string[]): string;
}
