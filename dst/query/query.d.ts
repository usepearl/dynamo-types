export declare type Conditions<T> = (["=", T] | ["<", T] | ["<=", T] | [">", T] | [">=", T] | ["beginsWith", T] | ["between", T, T]);
export declare function parseCondition<T>(condition: Conditions<T>, rangeKeyName: string): {
    conditionExpression: string;
    expressionAttributeValues: {
        ":rkv": T;
        ":rkv1"?: undefined;
        ":rkv2"?: undefined;
    };
} | {
    conditionExpression: string;
    expressionAttributeValues: {
        ":rkv1": T;
        ":rkv2": T;
        ":rkv"?: undefined;
    };
};
