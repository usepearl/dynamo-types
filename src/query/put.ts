import { ITable, Table } from "../table";
import * as Codec from '../codec';
import { AttributeNotExists, Conditions } from "./expressions/conditions";
import { buildCondition } from "./expressions/transformers";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { batchWrite } from "./batch_write";
import { UniqueKey } from "../metadata/unique_key";
import { isSingleTableKey } from "../metadata/table";

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
  const conditions = options.condition === undefined ? [] : Array.isArray(options.condition) ? options.condition : [options.condition]
  const keyCondition: Conditions<any> = isSingleTableKey(tableClass.metadata.primaryKey) ? {
    [tableClass.metadata.primaryKey.hash.name]: AttributeNotExists(),
    classKey: AttributeNotExists()
  } : {
    [tableClass.metadata.primaryKey.hash.name]: AttributeNotExists(),
  }

  const condition = buildCondition(tableClass.metadata, [...conditions, keyCondition]);
  const recordInput = {
    Item: Codec.serialize(tableClass, record),
    TableName: tableClass.metadata.name,
    ...condition,
  };

  const inputs = convertToUniquePutInputs(tableClass, record);
  const items = [recordInput, ...inputs].map((params) => {
    return {
      Put: params
    }
  });

  const relationshipInputs = tableClass.metadata.relationshipKeys
    .reduce((toRet: DocumentClient.TransactWriteItem[], relation) => {
      const inputs = relation.generatePutRelationInput(tableClass, record, options);
      inputs.forEach((input) => toRet.push(input));
      return toRet;
    }, [])

  

  const copyInputs = tableClass.metadata.relationshipKeys
  .reduce((toRet: DocumentClient.TransactWriteItem[], relation) => {
    const inputs = relation.generatePutCopyInput(tableClass, record, options);
    inputs.forEach((input) => {
      if (!toRet.find((i) => i.Put?.TableName === input.Put?.TableName)) {
        toRet.push(input)
      }
    });
    return toRet;
  }, [])
 
  console.log("PUT", JSON.stringify([...items, ...copyInputs, ...relationshipInputs], null , 2))

  await tableClass.metadata.connection.documentClient.transactWrite({
    TransactItems: [...items, ...copyInputs, ...relationshipInputs]
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