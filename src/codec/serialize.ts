import { Attribute } from "../metadata";
import { SingleTableKeyMetadata } from "../metadata/indexes";
import { isSingleTableKey } from "../metadata/table";
import { ITable, Table } from "../table";




export function serialize<T extends Table>(tableClass: ITable<T>, record: T, withRelationId?: string): { [key: string]: any } {
  const res: { [key: string]: any } = {};

  tableClass.metadata.attributes.forEach((attributeMetadata) => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr !== undefined) {
      res[attributeMetadata.name] = attr;
    }
  });

  if (isSingleTableKey(tableClass.metadata.primaryKey)) {
    const classKey = serializeClassKeys(tableClass, record.serialize(), !!withRelationId);
    res.classKey = classKey;
    if (!!withRelationId) {
      res.id = withRelationId;
    }
  }

  return res;
}

export function serializeUniqueKeyset<T extends Table>(tableClass: ITable<T>, record: T, uniqueKeys: string[]): string {
  const values: { [key: string]: string } = {};

  tableClass.metadata.attributes
  .filter((attributeMetadata) => {
    return uniqueKeys.includes(attributeMetadata.propertyName)
  })
  .forEach((attributeMetadata) => {
    const attr = record.getAttribute(attributeMetadata.name);
    if (attr !== undefined) {
      values[attributeMetadata.name] = attr.toString();
    }
  });

  return Object.values(values).join("_");
}


export function serializeClassKeys<T extends Table>(tableClass: ITable<T>, record: { [key: string]: any }, forRelation: boolean): string {
  if (!isSingleTableKey(tableClass.metadata.primaryKey)) {
    throw new Error("Cannot serialize class keys because table is not SingleTable")
  }

  const keys = tableClass.metadata.primaryKey.classKeys
    // [ tableClass.metadata.primaryKey.hash, ...tableClass.metadata.primaryKey.classKeys ] 
  
  const values = keys.map((attribute) => {
    const value = record[attribute.name]
    if (value === undefined) {
      throw new Error(`Can't find ${attribute.propertyName}. Got: ${JSON.stringify(record, null, 2)}`)
    }
    
    return value.toString()
  });


  const valueStr = values.join("_");
  const keyStr = keys.map((attribute) => attribute.propertyName).join("_")
  return `${tableClass.metadata.className}_${keyStr}#${valueStr}`
}
