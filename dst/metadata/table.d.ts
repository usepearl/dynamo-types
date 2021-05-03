import * as Attribute from "./attribute";
import * as Indexes from "./indexes";
import * as Connection from "../connections";
import { UniqueKey } from "./unique_key";
export interface Metadata {
    name: string;
    attributes: Attribute.Metadata[];
    connection: Connection.Connection;
    globalSecondaryIndexes: Array<Indexes.FullGlobalSecondaryIndexMetadata | Indexes.HashGlobalSecondaryIndexMetadata>;
    localSecondaryIndexes: Indexes.LocalSecondaryIndexMetadata[];
    primaryKey: (Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata);
    uniqueKeys: UniqueKey[];
    uniqueKeyFieldList: string[];
}
export declare function createMetadata(): Metadata;
export declare function validateMetadata(metadata: Metadata): void;
