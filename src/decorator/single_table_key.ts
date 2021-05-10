import { ITable } from "../table";

export function SingleTableKey(hashKeyName: string, classKeys?: string[]) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = tableClass.metadata.attributes.find((attr) => attr.propertyName === hashKeyName);
    if (!hash) {
      throw new Error(`Given hashKey ${hashKeyName} is not declared as attribute`);
    }

    const realClassKeys = classKeys || [hashKeyName]

    const classAttributes = realClassKeys.map((key) => {
      const attribute = tableClass.metadata.attributes.find((attr) => attr.propertyName === key);
      if (!attribute) {
        throw new Error(`Given classKey ${key} is not declared as attribute`);
      }

      return attribute;
    });

    tableClass.metadata.primaryKey = {
      type: "SINGLE_TABLE",
      hash,
      name: propertyKey,
      classKeys: classAttributes,
      singleType: classKeys ? "RANGE" : "HASH",
      isPrimaryTable: true
    };
  };
}

export function SingleTableRelation(relationKeyName: string, tableName: string, classKeys?: string[], indexName?: string) {
  return (tableClass: ITable<any>, propertyKey: string) => {
    const hash = tableClass.metadata.attributes.find((attr) => attr.propertyName === relationKeyName);
    if (!hash) {
      throw new Error(`Given hashKey ${relationKeyName} is not declared as attribute`);
    }

    const realClassKeys = classKeys || [relationKeyName]

    const classAttributes = realClassKeys.map((key) => {
      const attribute = tableClass.metadata.attributes.find((attr) => attr.propertyName === key);
      if (!attribute) {
        throw new Error(`Given classKey ${key} is not declared as attribute`);
      }

      return attribute;
    });

    tableClass.metadata.relationshipKeys.push({
      type: "SINGLE_TABLE",
      hash,
      name: propertyKey,
      classKeys: classAttributes,
      singleType: classKeys ? "RANGE" : "HASH",
      relationTableName: tableName,
      isPrimaryTable: false,
      indexName
    });
  };
}