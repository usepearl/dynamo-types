import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Codec } from "..";
import { UniqueKey } from "../metadata/unique_key";
import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
import { buildCondition } from "./expressions/transformers";

export function convertToUniqueDeleteInputs<T extends Table>(
  tableClass: ITable<T>,
  record: T,
  filterKey?: UniqueKey
) {
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
    .map((key): DocumentClient.DeleteItemInput => {
      const keyValue = `${tableClass.metadata.className}_${key.name.toUpperCase()}#${Codec.serializeUniqueKeyset(tableClass, record, key.keys)}`;
      const item = key.sortKeyName ? {
        [key.primaryKeyName]: keyValue,
        [key.sortKeyName]: keyValue
      } : {
        [key.primaryKeyName]: keyValue
      };
      
      return {
        TableName: key.keyTableName ?? tableClass.metadata.name,
        Key: item
      };
    });

    return keyInputs;
  }
}

export async function deleteItem<T extends Table>(
  tableClass: ITable<T>,
  keys: { [key: string]: any },
  options: Partial<{
    condition: Conditions<T> | Array<Conditions<T>>;
    relationKey?: string
  }> = {},
) {

  const recordInput: DocumentClient.TransactWriteItem = {
      Delete: {
      TableName: tableClass.metadata.name,
      Key: keys,
      ...buildCondition(tableClass.metadata, options.condition),
    }
  }

  const relationshipPromises = await Promise.all(
    tableClass.metadata.relationshipKeys.map((relation) => relation.generateDeleteInputs(tableClass, keys, options.relationKey!, options))
  );

  const relationshipInputs = relationshipPromises
  .reduce((toRet: DocumentClient.TransactWriteItem[], inputs) => {
    inputs.forEach((input) => toRet.push(input));
    return toRet;
  }, [])

  const hasUniqueKeys = tableClass.metadata.uniqueKeys.length > 0;
  if (!hasUniqueKeys) {
    await tableClass.metadata.connection.documentClient.transactWrite({
      TransactItems: [recordInput, ...relationshipInputs]
    }).promise();
  } else {
    const item = await tableClass.metadata.connection.documentClient.get({
      TableName: tableClass.metadata.name,
      Key: keys,
      AttributesToGet: tableClass.metadata.uniqueKeyFieldList
    }).promise();

    if (!item.Item) {
      return
    }

    const record = Codec.deserialize(tableClass, item.Item!, tableClass.metadata.uniqueKeyFieldList)
    const keyInputs = convertToUniqueDeleteInputs(tableClass, record).map((params) => {
      return {
        Delete: params
      }
    })

    console.log("DELETING", JSON.stringify([recordInput, ...relationshipInputs, ...keyInputs], null, 2))

    await tableClass.metadata.connection.documentClient.transactWrite({
      TransactItems: [recordInput, ...relationshipInputs, ...keyInputs]
    }).promise();
  }
}