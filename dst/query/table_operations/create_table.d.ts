import * as Metadata from "../../metadata";
import { DynamoDB } from "aws-sdk";
export declare function createTable(metadata: Metadata.Table.Metadata): Promise<DynamoDB.TableDescription | undefined>;
