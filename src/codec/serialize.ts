import { DynamoDB } from "aws-sdk";
import {
  Attribute as AttributeMetadata,
  Table as TableMetadata,
} from "../metadata";
import { ITable, Table } from "../table";

import * as AttributeValue from "./attribute_value";

export function serialize<T extends Table>(tableClass: ITable<T>, record: T): { [key: string]: any } {
  const res: { [key: string]: any } = {};

  tableClass.metadata.attributes.forEach((attributeMetadata) => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr !== undefined) {
      res[attributeMetadata.name] = attr;
    }
  });

  return res;
}

export function serializeUniqueKeyset<T extends Table>(tableClass: ITable<T>, record: T, uniqueKeys: string[]): string {
  const values: { [key: string]: string } = {};

  tableClass.metadata.attributes
  .filter((attributeMetadata) => {
    return uniqueKeys.includes(attributeMetadata.name)
  })
  .forEach((attributeMetadata) => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr !== undefined) {
      values[attributeMetadata.name] = attr.toString();
    }
  });

  return Object.values(values).join("_");
}

