import { DynamoDB } from "aws-sdk";
import * as Attribute from "../metadata/attribute";
export declare function parse(v: DynamoDB.AttributeValue): {
    value: string;
    type: Attribute.Type;
} | {
    value: boolean;
    type: Attribute.Type;
} | {
    value: {
        [key: string]: any;
    };
    type: Attribute.Type;
} | {
    value: number;
    type: Attribute.Type;
} | {
    value: null;
    type: Attribute.Type;
};
