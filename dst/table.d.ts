import * as Metadata from "./metadata";
import { Conditions } from "./query/expressions/conditions";
export declare class Table {
    static get metadata(): Metadata.Table.Metadata;
    static set metadata(metadata: Metadata.Table.Metadata);
    static createTable(): Promise<void>;
    static dropTable(): Promise<void>;
    private __attributes;
    private __writer;
    getAttribute(name: string): any;
    setAttribute(name: string, value: any): void;
    setAttributes(attributes: {
        [name: string]: any;
    }): void;
    private get writer();
    save<T extends Table>(this: T, options?: Partial<{
        condition?: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<Table>;
    delete<T extends Table>(this: T, options?: Partial<{
        condition?: Conditions<T> | Array<Conditions<T>>;
    }>): Promise<void>;
    serialize(): {
        [key: string]: any;
    };
}
export interface ITable<T extends Table> {
    metadata: Metadata.Table.Metadata;
    new (): T;
}
