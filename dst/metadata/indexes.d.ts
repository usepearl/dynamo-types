import * as Attribute from "./attribute";
export interface Metadata {
    readonly name: string;
    readonly hashAttribute: Attribute.Metadata;
    readonly rangeAttribute?: Attribute.Metadata;
}
export interface HashPrimaryKeyMetadata {
    readonly type: "HASH";
    readonly name: string;
    readonly hash: Attribute.Metadata;
}
export interface FullPrimaryKeyMetadata {
    readonly type: "FULL";
    readonly name: string;
    readonly hash: Attribute.Metadata;
    readonly range: Attribute.Metadata;
}
export interface SingleTableKeyMetadata {
    readonly type: "SINGLE_TABLE";
    readonly name: string;
    readonly hash: Attribute.Metadata;
    readonly classKeys: Attribute.Metadata[];
    readonly singleType: "HASH" | "RANGE";
    readonly isPrimaryTable: boolean;
}
export interface RelationshipKeyMetadata extends SingleTableKeyMetadata {
    readonly indexName?: string;
    readonly relationTableName: string;
}
export interface FullGlobalSecondaryIndexMetadata {
    readonly type: "FULL";
    readonly name: string;
    readonly propertyName: string;
    readonly hash: Attribute.Metadata;
    readonly range: Attribute.Metadata;
}
export interface HashGlobalSecondaryIndexMetadata {
    readonly type: "HASH";
    readonly name: string;
    readonly propertyName: string;
    readonly hash: Attribute.Metadata;
}
export interface LocalSecondaryIndexMetadata {
    readonly name: string;
    readonly propertyName: string;
    readonly range: Attribute.Metadata;
}
