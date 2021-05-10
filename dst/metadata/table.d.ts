import * as Attribute from "./attribute";
import * as Indexes from "./indexes";
import * as Connection from "../connections";
import { UniqueKey } from "./unique_key";
import { RelationshipKey } from "../query/relationship_key";
export declare const isFullKey: (key: Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata | Indexes.SingleTableKeyMetadata) => key is Indexes.FullPrimaryKeyMetadata;
export declare const isSingleTableKey: (key: Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata | Indexes.SingleTableKeyMetadata) => key is Indexes.SingleTableKeyMetadata;
export interface Metadata {
    name: string;
    className: string;
    attributes: Attribute.Metadata[];
    connection: Connection.Connection;
    globalSecondaryIndexes: Array<Indexes.FullGlobalSecondaryIndexMetadata | Indexes.HashGlobalSecondaryIndexMetadata>;
    localSecondaryIndexes: Indexes.LocalSecondaryIndexMetadata[];
    primaryKey: (Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata | Indexes.SingleTableKeyMetadata);
    relationshipKeys: RelationshipKey<any, any>[];
    uniqueKeys: UniqueKey[];
    uniqueKeyFieldList: string[];
}
export declare function createMetadata(): Metadata;
export declare function validateMetadata(metadata: Metadata): void;
