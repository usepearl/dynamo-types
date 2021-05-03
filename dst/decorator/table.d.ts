import { ITable } from "../table";
import { Connection } from "../connections";
import { UniqueKey } from "../metadata/unique_key";
export declare function Table(options?: {
    name?: string;
    connection?: Connection;
    uniqueKeys?: UniqueKey[];
}): (target: ITable<any>) => void;
