import { DynamoDB } from "aws-sdk"
import { Codec } from "."
import { SingleTableKeyMetadata } from "./metadata/indexes"
import { isSingleTableKey } from "./metadata/table"
import { ITable, Table } from "./table"

export class SingleTable<T extends "HASH" | "RANGE"> extends Table {
  singleTableType: T
}

export type extractTableType<R> = R extends SingleTable<infer X> ? X : never
export class SingleMetaTableResult {
  constructor(private result: {[className: string]: any[]}, public classRefs: ITable<any>[]) {

  }

  extract<T extends SingleTable<"HASH" | "RANGE">>(classRef: ITable<T>): extractTableType<T> extends "HASH" ? T | undefined : T[] {
    if ((classRef.metadata.primaryKey as SingleTableKeyMetadata).singleType === 'HASH') {
      return this.result[classRef.metadata.className][0]
    }
    
    return this.result[classRef.metadata.className] as any ?? []
  }
}

export interface SingleTableHash {
  singleTableType: "HASH"
}

export interface SingleTableRange {
  singleTableType: "RANGE"
}

export class SingleMetaTable<HashKeyType = string> {
  private tablesRef: ITable<any>[]
  private rootRef: ITable<any>
  private key: SingleTableKeyMetadata

  constructor(...ref: ITable<any>[]) {
    this.tablesRef = ref;
    this.rootRef = ref[0]
    if (!isSingleTableKey(this.rootRef.metadata.primaryKey)) {
      throw new Error("Meta tables only work when the primary key is single table")
    }

    ref.forEach((table) => {
      if (table.metadata.name !== this.rootRef.metadata.name) {
        throw new Error("Meta tables only work when all child tables are stored in the same table")
      }

      if (!isSingleTableKey(table.metadata.primaryKey)) {
        throw new Error("All child tables need to have the primary key as single table")
      }
    })

    this.key = this.rootRef.metadata.primaryKey
  }

  public async get(hashKey: HashKeyType, options: { consistent: boolean, } = { consistent: false }): Promise<SingleMetaTableResult> {
    const items = await this.rootRef.metadata.connection.documentClient.query({
      TableName: this.rootRef.metadata.name,
      KeyConditionExpression: `#hash = :hash`,
      ConsistentRead: options.consistent,
      ExpressionAttributeNames: {
        "#hash": this.key.hash.name
      },
      ExpressionAttributeValues: {
        ":hash": hashKey
      }
      
    }).promise()
    if (!items.Items) {
      return new SingleMetaTableResult({}, []);
    } 

    const values: {[className: string]: any[]} ={}
    const tables: ITable<any>[] = []

    items.Items.forEach(item => {
      const className = item.classKey.split('_')[0]
      const table = this.tablesRef.find((ref) => ref.metadata.className === className)
      if (!table) {
        return;
      }

      if (!tables.includes(table)) {
        tables.push(table)
      }

      if (!values[className]) {
        values[className] = []
      }

      values[className].push(Codec.deserialize(table, item))
    })
    return new SingleMetaTableResult(values, tables)
  }

  public async query(
    hashKey: HashKeyType,
    options: {
      order?: "ASC" | "DESC",
      limit?: number,
      classes?: ITable<any>[],
      exclusiveStartKey?: {
        [className: string]: DynamoDB.DocumentClient.Key
      },
      consistent?: boolean
    } = {}
  ): Promise<{
    records: SingleMetaTableResult,
    info: {
      [className: string]: {
        count?: number,
        scannedCount?: number,
        lastEvaluatedKey?: DynamoDB.DocumentClient.Key,
        consumedCapacity?: DynamoDB.DocumentClient.ConsumedCapacity 
      }
    }
  }> {
    const ScanIndexForward = options.order === "ASC";

    const singleClass = () => {
      return [
        this.rootRef.metadata.connection.documentClient.query({
          TableName: this.rootRef.metadata.name,
          KeyConditionExpression: `#hash = :hash`,
          ExpressionAttributeNames: {
            '#hash': this.key.hash.name,
          },
          ExpressionAttributeValues: {
            ':hash': hashKey,
          },
          ScanIndexForward,
          ConsistentRead: options.consistent,
          Limit: options.limit,
          ExclusiveStartKey: options.exclusiveStartKey ? options.exclusiveStartKey['root'] : undefined,
          ReturnConsumedCapacity: "TOTAL",
    
        })
        .promise()
        .then((res) => ({
          result: res,
          classType: this.rootRef
        }))
      ]
    }
    
    const multipleClasses = () => {
      return options.classes!.map((classType) => this.rootRef.metadata.connection.documentClient.query({
          TableName: this.rootRef.metadata.name,
          KeyConditionExpression: `#hash = :hash AND begins_with(#classKey, :${classType.metadata.className})`,
          ExpressionAttributeNames: {
            '#hash': this.key.hash.name,
            '#classKey': 'classKey'
          },
          ExpressionAttributeValues: {
            ':hash': hashKey,
            [`:${classType.metadata.className}`]: classType.metadata.className
          },
          ScanIndexForward,
          ConsistentRead: options.consistent,
          Limit: options.limit,
          ExclusiveStartKey: options.exclusiveStartKey ? options.exclusiveStartKey[classType.metadata.className] : undefined,
          ReturnConsumedCapacity: "TOTAL",
    
        })
        .promise()
        .then((res) => ({
          result: res,
          classType 
        }))
      )
    }

    const promises = options.classes ? multipleClasses() : singleClass();
    const results = await Promise.all(promises);
  
    const values: {[className: string]: any[]} ={}
    const tables: ITable<any>[] = []
    const info: {[className: string]: {
      count?: number,
      scannedCount?: number,
      lastEvaluatedKey?: DynamoDB.DocumentClient.Key,
      consumedCapacity?: DynamoDB.DocumentClient.ConsumedCapacity 
    }} = {}

    for (const result of results) {
      info[result.classType.metadata.className] = {
        consumedCapacity: result.result.ConsumedCapacity,
        count: result.result.Count,
        lastEvaluatedKey: result.result.LastEvaluatedKey,
        scannedCount: result.result.ScannedCount
      }

      result.result.Items?.forEach(item => {
        const className = item.classKey.split('_')[0]
        const table = this.tablesRef.find((ref) => ref.metadata.className === className)
        if (!table) {
          return;
        }

        
  
        if (!tables.includes(table)) {
          tables.push(table)
        }
  
        if (!values[className]) {
          values[className] = []
        }
  
        values[className].push(Codec.deserialize(table, item))
      })
    }

    
    return {
      records: new SingleMetaTableResult(values, tables),
      info
    };
  }
}