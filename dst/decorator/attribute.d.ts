import "reflect-metadata";
import { Table } from "../table";
export declare function Attribute<T>(options?: {
    name?: string;
    timeToLive?: true;
}): (record: Table, propertyName: string) => void;
