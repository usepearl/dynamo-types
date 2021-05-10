import * as Metadata from "../metadata";
import * as Query from "../query";
import { ITable, Table as TableClass } from "../table";

import Config from "../config";
import { Connection } from "../connections";
import { UniqueKey } from "../metadata/unique_key";
import { isFullKey, isSingleTableKey } from "../metadata/table";
import { RelationshipKey } from "../query/relationship_key";

// Table Decorator
export function Table(options: { tableName: string, connection?: Connection, uniqueKeys?: UniqueKey[], className?: string, }) {
  return (target: ITable<any>) => {
    target.metadata.connection = options.connection || Config.defaultConnection;
    target.metadata.className = options.className || target.name;

    target.metadata.name = options.tableName;
    target.metadata.uniqueKeys = options.uniqueKeys || [];
    target.metadata.uniqueKeyFieldList = [];
    target.metadata.uniqueKeys.forEach((key) => {
      key.keys.forEach((keyField) => {
        const attr = target.metadata.attributes.find((attr) => attr.propertyName === keyField)!

        let realKey = `${target.metadata.className}_${attr.name}`;
        if (target.metadata.primaryKey.hash.name === attr.name) {
          realKey = attr.name;
        }

        if (isFullKey(target.metadata.primaryKey) && target.metadata.primaryKey.range.name === attr.name) {
          realKey = attr.name;
        }

        if (!target.metadata.uniqueKeyFieldList.includes(realKey)) {
          target.metadata.uniqueKeyFieldList.push(realKey);
        }
      });
    });

    // Table Decorator Executed at last,
    // So Validate metadata, presume all the setups are finisehd
    Metadata.Table.validateMetadata(target.metadata);

    // After validation, setup some methods.
    defineAttributeProperties(target);
    definePrimaryKeyProperty(target);
    defineUniqueKeys(target);
    
    defineGlobalSecondaryIndexes(target);
    defineLocalSecondaryIndexes(target);
  };
}

function defineAttributeProperties(table: ITable<any>) {
  table.metadata.attributes.forEach((attr) => {
    Object.defineProperty(
      table.prototype,
      attr.propertyName,
      {
        configurable: true,
        enumerable: true,
        get(this: TableClass) {
          return this.getAttribute(attr.name);
        },
        set(this: TableClass, v) {
          this.setAttribute(attr.name, v);
        },
      },
    );
  });
}

function defineUniqueKeys(table: ITable<any>) {
  table.metadata.uniqueKeys.forEach((key) => {
    Object.defineProperty(
      table.prototype,
      key.name,
      {
        configurable: true,
        enumerable: true,
        get(this: TableClass) {
          return this.getAttribute(key.name)
        },
        set(this: TableClass, v) {
          this.setAttribute(key.name, v)
        }
      }
    )
  })
}


function defineGlobalSecondaryIndexes(table: ITable<any>) {
  table.metadata.globalSecondaryIndexes.forEach((metadata) => {
    if (metadata.type === "HASH") {
      Object.defineProperty(
        table,
        metadata.propertyName,
        {
          value: new Query.HashGlobalSecondaryIndex(table, metadata),
          writable: false,
        },
      );
    } else {
      Object.defineProperty(
        table,
        metadata.propertyName,
        {
          value: new Query.FullGlobalSecondaryIndex(table, metadata),
          writable: false,
        },
      );
    }
  });
}

function defineLocalSecondaryIndexes(table: ITable<any>) {
  table.metadata.localSecondaryIndexes.forEach((metadata) => {
    Object.defineProperty(
      table,
      metadata.propertyName,
      {
        value: new Query.LocalSecondaryIndex(table, metadata),
        writable: false,
      },
    );
  });
}

function definePrimaryKeyProperty(table: ITable<any>) {
  if (table.metadata.primaryKey) {
    const pkMetdata = table.metadata.primaryKey;
    if (pkMetdata.type === "FULL") {
      Object.defineProperty(
        table,
        pkMetdata.name,
        {
          value: new Query.FullPrimaryKey(table, pkMetdata),
          writable: false,
        },
      );
    } else if (pkMetdata.type === "HASH") {
      Object.defineProperty(
        table,
        pkMetdata.name,
        {
          value: new Query.HashPrimaryKey(table, pkMetdata),
          writable: false,
        },
      );
    } else {
      Object.defineProperty(
        table,
        pkMetdata.name,
        {
          value: new Query.SingleTableKey(table, pkMetdata),
          writable: false,
        },
      );
    }
  }
}
