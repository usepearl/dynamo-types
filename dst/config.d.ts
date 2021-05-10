import { Connection } from "./connections";
import { RelationshipKey } from "./query/relationship_key";
export default class Config {
    private static __defaultConnection;
    static get defaultConnection(): Connection;
    static initializeRelationships(relationships: Array<() => RelationshipKey<any, any>[]>): void;
}
