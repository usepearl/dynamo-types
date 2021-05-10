import { ITable, Table } from "../table";
import * as Codec from '../codec';
import { Conditions } from "./expressions/conditions";
import { buildCondition } from "./expressions/transformers";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { batchWrite } from "./batch_write";
import { UniqueKey } from "../metadata/unique_key";

export const convertToUniquePutInputs = <T extends Table>(
  tableClass: ITable<T>,
  record: T,
  filterKey?: UniqueKey
): DocumentClient.PutItemInput[] => {
  const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
  if (!hasUniqueKeys) {
    return [];
  } else {
    const keyInputs = tableClass.metadata.uniqueKeys
    .filter((key) => {
      if (!filterKey) {
        return true
      }

      return key === filterKey;
    })
    .map((key): DocumentClient.PutItemInput => {
      const keyValue = `${tableClass.metadata.className}_${key.name.toUpperCase()}#${Codec.serializeUniqueKeyset(tableClass, record, key.keys)}`;
      const item = key.sortKeyName ? {
        [key.primaryKeyName]: keyValue,
        [key.sortKeyName]: keyValue
      } : {
        [key.primaryKeyName]: keyValue
      };
      
      return {
        TableName: key.keyTableName ?? tableClass.metadata.name,
        Item: item,
        ConditionExpression: `attribute_not_exists(${key.primaryKeyName})`
      };
    });

    return keyInputs;
  }
}

export async function put<T extends Table>(
  tableClass: ITable<T>,
  record: T,
  options: Partial<{
    condition: Conditions<T> | Array<Conditions<T>>;
  }> = {})
{
  const recordInput = {
    Item: Codec.serialize(tableClass, record),
    TableName: tableClass.metadata.name,
    ...buildCondition(tableClass.metadata, options.condition),
  };

  const relationshipInputs = tableClass.metadata.relationshipKeys
    .filter(relation => record.getAttribute(relation.hash.name) !== undefined)
    .map(relation => {
      return {
        Item: Codec.serialize(tableClass, record, record.getAttribute(relation.hash.name)),
        TableName: relation.relationTableName!,
        ...buildCondition(tableClass.metadata, options.condition),
      }
    })

    const inputs = convertToUniquePutInputs(tableClass, record);  

    await tableClass.metadata.connection.documentClient.transactWrite({
      TransactItems: [recordInput, ...relationshipInputs, ...inputs].map((params) => {
        return {
          Put: params
        }
      })
    }).promise();

    return record;
}

export async function batchPut<T extends Table>(
  tableClass: ITable<T>,
  records: T[]
) {
  const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
  if (hasUniqueKeys || tableClass.metadata.relationshipKeys.length > 0) {
    for(const record of records) {
      await put(tableClass, record);
    }
  } else {
    await batchWrite(
      tableClass.metadata.connection.documentClient,
      tableClass.metadata.name,
      records.map((record) => {
        return {
          PutRequest: {
            Item: Codec.serialize(tableClass, record)
          }
        }
      })
    )
  }
}