import { DynamoDB } from "aws-sdk";

import * as Codec from "../codec";
import { serializeClassKeys } from "../codec/serialize";
import * as Metadata from "../metadata";
import { extractTableType, SingleTable } from "../single_table";
import { ITable } from "../table";

import { deleteItem } from "./delete";

import { AttributeExists, AttributeNotExists, Conditions } from "./expressions/conditions";
import { buildCondition, buildUniqueKeyUpdates, buildUpdate } from "./expressions/transformers";
import { UpdateChanges } from "./expressions/update";

export class SingleTableKey<T extends SingleTable<"HASH" | "RANGE">, HashKeyType> {
  constructor(
    readonly tableClass: ITable<T>,
    readonly metadata: Metadata.Indexes.SingleTableKeyMetadata,
  ) {}

  public async delete(
    hashKey: HashKeyType,
    classKeys: { [ key: string]: any } = {},
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    classKeys[this.metadata.hash.name] = hashKey;
    this.metadata.classKeys.forEach((key) => {
      if (classKeys[key.propertyName] === undefined && classKeys[key.name] === undefined) {
        throw new Error(`Cannot delete because missing value for ${key.propertyName}. Got: ${JSON.stringify(classKeys, null, 2)}`)
      }

      classKeys[key.name] = classKeys[key.propertyName]
    })

    const classKey = serializeClassKeys(this.tableClass, classKeys);
    const relationKey = serializeClassKeys(this.tableClass, classKeys);

    return deleteItem(this.tableClass, {
      [this.metadata.hash.name]: hashKey,
      classKey
    }, {
      ...options,
      relationKey
    });
  }

  public async get(hashKey: HashKeyType, classKeys?: {[key: string]: any}, options: { consistent?: boolean, } = { consistent: false }): Promise<T | null> {
    const classValue = classKeys || {
      [this.metadata.hash.name]: hashKey 
    }
    
    this.metadata.classKeys.forEach((key) => {
      if (classValue[key.propertyName] === undefined  && classValue[key.name] === undefined) {
        throw new Error(`Cannot get because the classKey is required for: ${key.propertyName}. Got: ${JSON.stringify(classValue, null, 2)}`)
      }

      classValue[key.name] = classValue[key.propertyName]
    })

    const hashClassKey = serializeClassKeys(this.tableClass, classValue)

    const dynamoRecord =
      await this.tableClass.metadata.connection.documentClient.get({
        TableName: this.tableClass.metadata.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          classKey: hashClassKey
        },
        ConsistentRead: options.consistent,
      }).promise();
    if (!dynamoRecord.Item) {
      return null;
    } else {
      return Codec.deserialize(this.tableClass, dynamoRecord.Item);
    }
  }

  public async query(
    hashKey: HashKeyType,
    options: {
      order?: "ASC" | "DESC",
      limit?: number,
      exclusiveStartKey?: DynamoDB.DocumentClient.Key,
      consistent?: boolean
    } = {}
  ): Promise<{
    records: extractTableType<T> extends "HASH" ? T | null : T[] ,
    count?: number,
    scannedCount?: number,
    lastEvaluatedKey?: DynamoDB.DocumentClient.Key,
    consumedCapacity?: DynamoDB.DocumentClient.ConsumedCapacity 
  }> {
    const ScanIndexForward = options.order === "ASC";

    const result = await this.tableClass.metadata.connection.documentClient.query({
      TableName: this.tableClass.metadata.name,
      KeyConditionExpression: `#hash = :hash AND begins_with(#classKey, :classKey)`,
      ExpressionAttributeNames: {
        '#hash': this.metadata.hash.name,
        '#classKey': 'classKey'
      },
      ExpressionAttributeValues: {
        ':hash': hashKey,
        ':classKey': this.tableClass.metadata.className
      },
      ScanIndexForward,
      ConsistentRead: options.consistent,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",

    }).promise()

    const getRecords = () => {
      if (this.metadata.singleType === "HASH") {
        if (!result.Items) {
          return null;
        }
  
        return Codec.deserialize(this.tableClass, result.Items[0]);
      }
  
      if (!result.Items) {
        return [];
      } 
      return result.Items.map(item => Codec.deserialize(this.tableClass, item));
    }

    return {
      records: getRecords() as any,
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
      consumedCapacity: result.ConsumedCapacity,
    };

    
  }

  public async scan(options: {
    limit?: number,
    totalSegments?: number,
    segment?: number,
    exclusiveStartKey?: DynamoDB.DocumentClient.Key,
  } = {}) {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableClass.metadata.name,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
      ReturnConsumedCapacity: "TOTAL",
      TotalSegments: options.totalSegments,
      Segment: options.segment,
    };

    const result = await this.tableClass.metadata.connection.documentClient.scan(params).promise();

    return {
      records: (result.Items || []).map((item) => {
        return Codec.deserialize(this.tableClass, item);
      }),
      count: result.Count,
      scannedCount: result.ScannedCount,
      lastEvaluatedKey: result.LastEvaluatedKey,
      consumedCapacity: result.ConsumedCapacity,
    };
  }

  public async update(
    hashKey: HashKeyType,
    classKeys: { [ key: string]: any } = {},
    changes: Partial<UpdateChanges<T>>,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {condition: []},
  ): Promise<void> {
    classKeys[this.metadata.hash.name] = hashKey;
    this.metadata.classKeys.forEach((key) => {
      if (!classKeys[key.propertyName]) {
        throw new Error(`Cannot delete because missing value for ${key.propertyName}`)
      }
    })

    const classKey = serializeClassKeys(this.tableClass, classKeys);
    const update = buildUpdate(this.tableClass.metadata, changes);

    const conditions = options.condition === undefined ? [] : Array.isArray(options.condition) ? options.condition : [options.condition]
    const keyCondition: Conditions<any> = {
      [this.metadata.hash.name]: AttributeExists(),
      classKey: AttributeExists()
    }

    const condition = buildCondition(this.tableClass.metadata, [...conditions, keyCondition]);

    const input = {
      Update: {
        TableName: this.tableClass.name,
        Key: {
          [this.metadata.hash.name]: hashKey,
          classKey
        },
        UpdateExpression: update.UpdateExpression,
        ConditionExpression: condition.ConditionExpression,
        ExpressionAttributeNames: { ...update.ExpressionAttributeNames, ...condition.ExpressionAttributeNames },
        ExpressionAttributeValues: { ...update.ExpressionAttributeValues, ...condition.ExpressionAttributeValues },
      }
    }

    const relationshipPromises = await Promise.all(
      this.tableClass.metadata.relationshipKeys.map((relation) => relation.generateUpdateInputs(this.tableClass, hashKey, classKey))
    );

    const foundRelationships = relationshipPromises
    .reduce((toRet: {tableName: string, id: string}[], inputs) => {
      inputs.forEach((input) => toRet.push(input));
      return toRet;
    }, [])
    
    const relationshipInputs = foundRelationships.map((relation) => {
      return {
        Update: {
          TableName: relation.tableName,
          Key: {
            id: relation.id,
            classKey
          },
          UpdateExpression: update.UpdateExpression,
          ConditionExpression: condition.ConditionExpression,
          ExpressionAttributeNames: { ...update.ExpressionAttributeNames, ...condition.ExpressionAttributeNames },
          ExpressionAttributeValues: { ...update.ExpressionAttributeValues, ...condition.ExpressionAttributeValues },
        }
      }
    })

    if (this.tableClass.metadata.uniqueKeys.length === 0) {
      await this.tableClass.metadata.connection.documentClient.transactWrite({
        TransactItems: [input, ...relationshipInputs ]
      }).promise();
    } else {
      const updates = await buildUniqueKeyUpdates(this.tableClass, changes, {
        [this.metadata.hash.name]: hashKey,
        classKey
      });
      await this.tableClass.metadata.connection.documentClient.transactWrite({
        TransactItems: [
        input,
          ...relationshipInputs,
        ...updates]
      }).promise();
    }
  }
}
