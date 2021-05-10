import { DocumentClient } from "aws-sdk/clients/dynamodb"
import { Codec } from ".."
import { serializeClassKeys } from "../codec/serialize"
import { Attribute } from "../metadata"
import { ITable, Table } from "../table"
import { Conditions } from "./expressions/conditions"
import { buildCondition } from "./expressions/transformers"

export type Relation<T extends Table> = {
  referenceField: Attribute.Metadata
  referenceTable: ITable<T>
  copyToRelationTable: boolean
}

export interface RelationshipKey<S1 extends Table, S2 extends Table> {
  sideOne: Relation<S1>
  sideTwo: Relation<S2>
  tableInRelation<T extends Table>(tableClass: ITable<T>): boolean;
  generatePutRelationInput<T extends Table>(tableClass: ITable<T>, record: T, options: Partial<{condition: Conditions<T> | Array<Conditions<T>>}>): DocumentClient.TransactWriteItem[];
  generatePutCopyInput<T extends Table>(tableClass: ITable<T>, record: T, options: Partial<{condition: Conditions<T> | Array<Conditions<T>>}>): DocumentClient.TransactWriteItem[];
 
  generateDeleteInputs<T extends Table>(tableClass: ITable<T>, keys: { [key: string]: any }, relationKey: string, options: Partial<{condition: Conditions<T> | Array<Conditions<T>>}>): Promise<DocumentClient.TransactWriteItem[]>
  generateUpdateInputs<T extends Table, HashKeyType>(tableClass: ITable<T>, hashKey: HashKeyType, classKey: string): Promise<{ tableName: string, id: string }[]>
}


export class OneToOneRelation<S1 extends Table, S2 extends Table> implements RelationshipKey<S1, S2> {
  sideOne: Relation<S1>
  sideTwo: Relation<S2>
  constructor(
    sideOne: { referenceTable: ITable<S1>, referenceField: string, copyToRelationTable: boolean },
    sideTwo: { referenceTable: ITable<S2>, referenceField: string, copyToRelationTable: boolean },
  ) {
    const metadata1 = sideOne.referenceTable.metadata.attributes.find(attr => attr.propertyName === sideOne.referenceField)
    const metadata2 = sideTwo.referenceTable.metadata.attributes.find(attr => attr.propertyName === sideTwo.referenceField)

    if (!metadata1) {
      throw new Error(`Cannot find field ${sideOne.referenceField}`)
    }

    if (!metadata2) {
      throw new Error(`Cannot find field ${sideTwo.referenceField}`)
    }

    this.sideOne = {
      copyToRelationTable: sideOne.copyToRelationTable,
      referenceField: metadata1,
      referenceTable: sideOne.referenceTable
    }

    this.sideTwo = {
      copyToRelationTable: sideTwo.copyToRelationTable,
      referenceField: metadata2,
      referenceTable: sideTwo.referenceTable
    }
  }

  tableInRelation<Z extends Table>(tableClass: ITable<Z>) {
    return this.sideTwo.referenceTable.name === tableClass.name || this.sideTwo.referenceTable.name === tableClass.name;
  }

  generatePutCopyInput<Z extends Table>(tableClass: ITable<Z>,
    record: Z,
    options: Partial<{
      condition: Conditions<Z> | Array<Conditions<Z>>;
    }> = {}) {

      if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
        return []
      }
  
      const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
      const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;

      if (!sourceRelation.copyToRelationTable) {
        return []
      }

      const toPut = Codec.serialize(tableClass, record, record.getAttribute(sourceRelation.referenceField.name))
      const copyItem: DocumentClient.TransactWriteItem = {
        Put: {
          TableName: targetRelation.referenceTable.metadata.name,
          Item: toPut,
          ConditionExpression: `attribute_not_exists(#id) AND attribute_not_exists(#classKey)`,
          ExpressionAttributeNames: {
            '#id': targetRelation.referenceTable.metadata.primaryKey.hash.name,
            '#classKey': 'classKey'
          },
        }
      };

      return [copyItem];
    }

  generatePutRelationInput<Z extends Table>(tableClass: ITable<Z>,
    record: Z,
    options: Partial<{
      condition: Conditions<Z> | Array<Conditions<Z>>;
    }> = {}) {

    if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
      return []
    }

    const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
    const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
    if (!record.getAttribute(sourceRelation.referenceField.name)) {
      return []
    }

    const updateClassKey = serializeClassKeys<S2 | S1>(targetRelation.referenceTable, record.serialize(), {
      [targetRelation.referenceTable.metadata.primaryKey.hash.name]: sourceRelation.referenceField
    })

    const updateTargetId: DocumentClient.TransactWriteItem = {
      Update: {
        TableName: targetRelation.referenceTable.metadata.name,
        Key: {
          [targetRelation.referenceTable.metadata.primaryKey.hash.name]: record.getAttribute(sourceRelation.referenceField.name),
          classKey: updateClassKey
        },
        ConditionExpression: `attribute_exists(#id) AND attribute_exists(#classKey)`,
        UpdateExpression: `SET #ref = :refId`,
        ExpressionAttributeNames: {
          '#id': 'id',
          '#classKey': 'classKey',
          '#ref': targetRelation.referenceField.name
        },
        ExpressionAttributeValues: {
          ':refId': record.getAttribute(targetRelation.referenceTable.metadata.primaryKey.hash.name)
        },
        
      }
    };

    return [updateTargetId];
  }

  async generateDeleteInputs<Z extends Table>(tableClass: ITable<Z>,
    keys: { [key: string]: any },
    relationKey: string,
    options: Partial<{
      condition: Conditions<Z> | Array<Conditions<Z>>;
    }> = {}) {

    if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
      return [];
    }

    const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
    const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;

    const referenceKey = await tableClass.metadata.connection.documentClient.get({
      TableName: sourceRelation.referenceTable.metadata.name,
      Key: keys,
    }).promise();
    
    if (!referenceKey.Item || !referenceKey.Item[sourceRelation.referenceField.name]) {
      return [];
    }

    const updateClassKey = serializeClassKeys<S2 | S1>(targetRelation.referenceTable, referenceKey.Item, {
      [targetRelation.referenceTable.metadata.primaryKey.hash.name]: sourceRelation.referenceField
    });
    const removeTargetId: DocumentClient.TransactWriteItem = {
      Update: {
        TableName: targetRelation.referenceTable.metadata.name,
        Key: {
          [targetRelation.referenceTable.metadata.primaryKey.hash.name]: referenceKey.Item[sourceRelation.referenceField.name],
          classKey: updateClassKey
        },
        UpdateExpression: `REMOVE #${targetRelation.referenceField.name}`,
        ExpressionAttributeNames: {
          [`#${targetRelation.referenceField.name}`]: targetRelation.referenceField.name,
        },
      }
    };

    if (!sourceRelation.copyToRelationTable) {
      return [removeTargetId];
    }

    const deleteCopy: DocumentClient.TransactWriteItem = {
      Delete: {
        TableName: targetRelation.referenceTable.metadata.name,
        Key: {
          id: referenceKey.Item[sourceRelation.referenceField.name],
          classKey: relationKey
        },
        ...buildCondition(tableClass.metadata, options.condition),
      }
    };


    return [deleteCopy, removeTargetId]
  }

  async generateUpdateInputs<Z extends Table, HashKeyType>(tableClass: ITable<Z>, hashKey: HashKeyType, classKey: string) {
    if (this.sideOne.referenceTable.name !== tableClass.name && this.sideTwo.referenceTable.name !== tableClass.name) {
      return [];
    }

    const sourceRelation = this.sideOne.referenceTable.name === tableClass.name ? this.sideOne : this.sideTwo;
    if (!sourceRelation.copyToRelationTable) {
      return [];
    }

    const targetRelation = sourceRelation === this.sideOne ? this.sideTwo : this.sideOne;
    const referenceKey = await tableClass.metadata.connection.documentClient.get({
      TableName: sourceRelation.referenceTable.metadata.name,
      Key: {
        id: hashKey,
        classKey
      },
      ProjectionExpression: sourceRelation.referenceField.name,
    }).promise();

    if (!referenceKey.Item || !referenceKey.Item[sourceRelation.referenceField.name]) {
      return [];
    }

    return [{
      tableName: targetRelation.referenceTable.metadata.name, id: referenceKey.Item.id
    }];
  }

  // async getRelation(table: S1 | S2, ) {

  // }
}