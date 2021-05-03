import * as Metadata from "../../../metadata";
import { Conditions } from "../conditions";
export declare function buildCondition<T>(metadata: Metadata.Table.Metadata, condition?: Conditions<T> | Array<Conditions<T>>): Partial<{
    ConditionExpression: string;
    ExpressionAttributeNames: {
        [key: string]: string;
    };
    ExpressionAttributeValues: {
        [key: string]: any;
    };
}>;
