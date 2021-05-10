import { ITable } from "../table";
import { Connection } from "../connections";
import { UniqueKey } from "../metadata/unique_key";
export declare function Table(options: {
    tableName: string;
    connection?: Connection;
    uniqueKeys?: UniqueKey[];
    className?: string;
}): (target: ITable<any>) => void;
