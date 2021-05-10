// Since in DyanmoDB writing is free from any kind index or what soever
// whole "writing" operations are bundled into one here

import { ITable, Table } from "../table";
import * as Metadata from "../metadata";
import { Conditions } from "./expressions/conditions";
import { batchPut, put } from "./put";
import { deleteItem } from "./delete";
import { serializeClassKeys } from "../codec/serialize";

export class Writer<T extends Table> {
  constructor(private tableClass: ITable<T>) {
  }

  public async put(
    record: T,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    return put(this.tableClass, record, options);
  }

  public async batchPut(records: T[]) {
    return batchPut(this.tableClass, records);
  }

  public async delete(
    record: T,
    options: Partial<{
      condition: Conditions<T> | Array<Conditions<T>>;
    }> = {},
  ) {
    return deleteItem(this.tableClass, KeyFromRecord(record, this.tableClass.metadata.primaryKey), options);
  }
}

function KeyFromRecord<T extends Table>(
  record: T,
  metadata: Metadata.Indexes.FullPrimaryKeyMetadata | Metadata.Indexes.HashPrimaryKeyMetadata | Metadata.Indexes.SingleTableKeyMetadata,
) {
  if (metadata.type === "HASH") {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
    };
  } else if (metadata.type === "FULL") {
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
      [metadata.range.name]: record.getAttribute(metadata.range.name),
    };
  } else {
    const classKey = serializeClassKeys(this.tableClass, record.serialize(), false);
    return {
      [metadata.hash.name]: record.getAttribute(metadata.hash.name),
      classKey
    }
  }
}
