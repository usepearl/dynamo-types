import * as Attribute from "./attribute";
import * as Indexes from "./indexes";

import * as Connection from "../connections";
import { UniqueKey } from "./unique_key";
import { RelationshipKey } from "../query/relationship_key";

// Table consists of
// - Attributes
// - Indexes

export const isFullKey = (key: Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata | Indexes.SingleTableKeyMetadata): key is Indexes.FullPrimaryKeyMetadata => {
  return (key as Indexes.FullPrimaryKeyMetadata).range !== undefined
}

export const isSingleTableKey = (key: Indexes.FullPrimaryKeyMetadata | Indexes.HashPrimaryKeyMetadata | Indexes.SingleTableKeyMetadata): key is Indexes.SingleTableKeyMetadata => {
  return (key as Indexes.SingleTableKeyMetadata).classKeys !== undefined
}

export interface Metadata {
  name: string; // name of the table on DynamoDB
  className: string;
  attributes: Attribute.Metadata[]; // List of attributes this table has
  connection: Connection.Connection; // DynamoDB Database Connection
  globalSecondaryIndexes: Array<
    Indexes.FullGlobalSecondaryIndexMetadata
    | Indexes.HashGlobalSecondaryIndexMetadata
  >;
  localSecondaryIndexes: Indexes.LocalSecondaryIndexMetadata[];
  // Default Index, which every table must have
  primaryKey: (
    Indexes.FullPrimaryKeyMetadata
   | Indexes.HashPrimaryKeyMetadata
   | Indexes.SingleTableKeyMetadata
  );
  relationshipKeys: RelationshipKey<any, any>[]
  uniqueKeys: UniqueKey[];
  uniqueKeyFieldList: string[];
}

export function createMetadata() {
  return {
    name: "",
    attributes: [],
    globalSecondaryIndexes: [],
    localSecondaryIndexes: [],
    relationshipKeys: []
  } as any as Metadata;
}

export function validateMetadata(metadata: Metadata) {
  if (!metadata.name) {
    throw new Error("Name must be provided for Table");
  }
  if (!metadata.primaryKey) {
    throw new Error("Table must have PrimaryKey");
  }
  if (!metadata.connection) {
    throw new Error("Table must have DynamoDB Connection");
  }

  if (isSingleTableKey(metadata.primaryKey)) {
    metadata.uniqueKeys.forEach((key) => key.sortKeyName = 'classKey')

    // Add classname to attributes
    metadata.attributes.forEach((attribute) => {
      if (metadata.primaryKey.hash.name === attribute.name) {
        return
      }

      attribute.name = `${metadata.className}_${attribute.name}`
    })
  }
  

  // TTL
  const ttlAttributes = metadata.attributes.filter((attribute) => attribute.timeToLive);
  if (ttlAttributes.length > 1) {
    throw new Error("TTL attribute must be one");
  } else if (ttlAttributes.length === 1) {
    const ttlAttribute = ttlAttributes[0];

    if (ttlAttribute.type !== Attribute.Type.Number) {
      throw new Error("TTL Attribute must be type of Number, with value of unix timestamp such as 1460232057");
    }
  } else {
    // no TTL Attribute, pass
  }
}
