import { DocumentClient, TransactWriteItem } from "aws-sdk/clients/dynamodb";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import * as _ from "lodash";
import { Codec } from "../../..";
import { deserialize } from "../../../codec";

import * as Metadata from "../../../metadata";
import { ITable, Table } from "../../../table";
import { convertToUniqueDeleteInputs } from "../../delete";
import { convertToUniquePutInputs } from "../../put";
import { AttributeNotExists } from "../conditions";
import { UpdateAction, UpdateChanges } from "../update";
import { buildCondition } from "./condition";

const UPDATE_NAME_REF_PREFIX = "#uk";
const UPDATE_VALUE_REF_PREFIX = ":uv";

const ACTION_TOKEN_MAP = new Map<UpdateAction, string>([
  ["PUT", "SET"],
  ["ADD", "ADD"],
  ["DELETE", "DELETE"],
]);

export function buildUpdate<T>(
  metadata: Metadata.Table.Metadata,
  changes: UpdateChanges<T>,
) {
  const keyRef = new Map<string, string>();
  const valueRef = new Map<string, any>();

  const keyNameCache = new Map<string, string>(metadata.attributes.map((attr) => [attr.propertyName, attr.name]));
  
  const expr = _(changes)
    .map((change, key) => ({ name: keyNameCache.get(key), action: change![0], value: change![1] }))
    .filter((change) => change.name !== undefined)
    .groupBy((change) => change.action)
    .map((groupedChanges, action: UpdateAction) => {
      const actions = groupedChanges.map((change) => {
        const keyPath = `${UPDATE_NAME_REF_PREFIX}${keyRef.size}`;
        keyRef.set(keyPath, change.name!);

        const valuePath = `${UPDATE_VALUE_REF_PREFIX}${valueRef.size}`;
        valueRef.set(valuePath, change.value);

        switch (action) {
          case "PUT":
            return `${keyPath} = ${valuePath}`;
          case "ADD":
          case "DELETE":
            return `${keyPath} ${valuePath}`;
        }
      });

      return `${ACTION_TOKEN_MAP.get(action)!} ${actions.join(", ")}`;
    })
    .join(" ");

  return {
    UpdateExpression: expr,
    ExpressionAttributeNames: keyRef.size > 0 ?
      Array.from(keyRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
    ExpressionAttributeValues: valueRef.size > 0 ?
      Array.from(valueRef.entries()).reduce((hash, [key, val]) => ({
        ...hash,
        [key]: val,
      }), {}) :
      undefined,
  };
}

export async function buildUniqueKeyUpdates<T extends Table, U>(
  tableClass: ITable<T>,
  changes: UpdateChanges<U>,
  itemKeys: DocumentClient.Key
)
{

  const item = await tableClass.metadata.connection.documentClient.get({
    TableName: tableClass.metadata.name,
    Key: itemKeys,
    AttributesToGet: tableClass.metadata.uniqueKeyFieldList
  }).promise();

  const record = Codec.deserialize(tableClass, item.Item!, tableClass.metadata.uniqueKeyFieldList)

  const writeItems: {
    [key: string]: TransactWriteItem
  } = {};
  _(changes)
    .flatMap((change, key) => {
      return tableClass.metadata.uniqueKeys.map((uniqueKey) => ({
        name: key, uniqueKey, action: change![0], value: change![1] 
      }))
    })
    .filter((change) => !!change.uniqueKey)
    .groupBy((change) => change.action)
    .forEach((groupedChanges, action: UpdateAction) => {
      groupedChanges.forEach((change)  => {
        const deleteInputs = convertToUniqueDeleteInputs(tableClass, record, change.uniqueKey);
        
        if (action === "PUT" || action === "ADD") {
          const recordCopy = deserialize(tableClass, record.serialize())
          recordCopy.setAttribute(change.name, change.value)

          const putInputs = convertToUniquePutInputs(tableClass, recordCopy, change.uniqueKey);
          putInputs.forEach((pi) => {
            const writeKey = Object.values(pi.Item)[0]
            if (!writeItems[writeKey]) {
              writeItems[writeKey] = {
                Put: pi
              }
            }
          });
        }

        if (action === "PUT" || action === "DELETE") {
          deleteInputs.forEach((di) => {
            const writeKey = Object.values(di.Key)[0]
            if (!writeItems[writeKey]) {
              writeItems[writeKey] = {
                Delete: di
              }
            }
          });
        }

      });
    });

  const unsorted = Object.values(writeItems)
  const sorted = unsorted.sort((a, b) => a.Delete ? -1 : (b.Delete ? -1 : 1))
  return sorted;
}