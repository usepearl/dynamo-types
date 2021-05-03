import { DocumentClient, TransactWriteItem } from "aws-sdk/clients/dynamodb";
import * as Metadata from "../../../metadata";
import { ITable, Table } from "../../../table";
import { UpdateChanges } from "../update";
export declare function buildUpdate<T>(metadata: Metadata.Table.Metadata, changes: UpdateChanges<T>): {
    UpdateExpression: string;
    ExpressionAttributeNames: {} | undefined;
    ExpressionAttributeValues: {} | undefined;
};
export declare function buildUniqueKeyUpdates<T extends Table, U>(tableClass: ITable<T>, changes: UpdateChanges<U>, itemKeys: DocumentClient.Key): Promise<TransactWriteItem[]>;
