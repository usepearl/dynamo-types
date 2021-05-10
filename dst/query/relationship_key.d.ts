import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { Attribute } from "../metadata";
import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
export declare type Relation<T extends Table> = {
    referenceField: Attribute.Metadata;
    referenceTable: ITable<T>;
    copyToRelationTable: boolean;
};
export interface RelationshipKey<S1 extends Table, S2 extends Table> {
    sideOne: Relation<S1>;
    sideTwo: Relation<S2>;
    tableInRelation<T extends Table>(tableClass: ITable<T>): boolean;
    generatePutRelationInput<T extends Table>(tableClass: ITable<T>, record: T, options: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): DocumentClient.TransactWriteItem[];
    generatePutCopyInput<T extends Table>(tableClass: ITable<T>, record: T, options: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): DocumentClient.TransactWriteItem[];
    generateDeleteInputs<T extends Table>(tableClass: ITable<T>, keys: {
        [key: string]: any;
    }, relationKey: string, options: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<DocumentClient.TransactWriteItem[]>;
    generateUpdateInputs<T extends Table, HashKeyType>(tableClass: ITable<T>, hashKey: HashKeyType, classKey: string): Promise<{
        tableName: string;
        id: string;
    }[]>;
}
export declare class OneToOneRelation<S1 extends Table, S2 extends Table> implements RelationshipKey<S1, S2> {
    sideOne: Relation<S1>;
    sideTwo: Relation<S2>;
    constructor(sideOne: {
        referenceTable: ITable<S1>;
        referenceField: string;
        copyToRelationTable: boolean;
    }, sideTwo: {
        referenceTable: ITable<S2>;
        referenceField: string;
        copyToRelationTable: boolean;
    });
    tableInRelation<Z extends Table>(tableClass: ITable<Z>): boolean;
    generatePutCopyInput<Z extends Table>(tableClass: ITable<Z>, record: Z, options?: Partial<{
        condition: Conditions<Z> | Array<Conditions<Z>>;
    }>): DocumentClient.TransactWriteItem[];
    generatePutRelationInput<Z extends Table>(tableClass: ITable<Z>, record: Z, options?: Partial<{
        condition: Conditions<Z> | Array<Conditions<Z>>;
    }>): DocumentClient.TransactWriteItem[];
    generateDeleteInputs<Z extends Table>(tableClass: ITable<Z>, keys: {
        [key: string]: any;
    }, relationKey: string, options?: Partial<{
        condition: Conditions<Z> | Array<Conditions<Z>>;
    }>): Promise<DocumentClient.TransactWriteItem[]>;
    generateUpdateInputs<Z extends Table, HashKeyType>(tableClass: ITable<Z>, hashKey: HashKeyType, classKey: string): Promise<{
        tableName: string;
        id: any;
    }[]>;
}
