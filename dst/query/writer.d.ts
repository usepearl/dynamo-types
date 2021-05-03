import { ITable, Table } from "../table";
import { Conditions } from "./expressions/conditions";
export declare class Writer<T extends Table> {
    private tableClass;
    constructor(tableClass: ITable<T>);
    put(record: T, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<T>;
    batchPut(records: T[]): Promise<void>;
    delete(record: T, options?: Partial<{
        condition: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
}
