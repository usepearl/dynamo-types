import { Connection, DynamoDBConnection } from "./connections";
import { RelationshipKey } from "./query/relationship_key";

export default class Config {
  private static __defaultConnection: Connection; // tslint:disable-line
  public static get defaultConnection() {
    if (!this.__defaultConnection) {
      this.__defaultConnection = new DynamoDBConnection({
        endpoint: process.env.DYNAMO_TYPES_ENDPOINT as string | undefined,
        enableAWSXray: process.env.ENABLE_XRAY === "true",
      });
    }
    return this.__defaultConnection;
  }

  public static initializeRelationships(relationships: Array<() => RelationshipKey<any, any>[]>) {
    for (const relationshipFunc of relationships) {
      const relations = relationshipFunc()
      relations.forEach(relation => {
        if (!relation.sideOne.referenceTable.metadata.relationshipKeys.includes(relation)) {
          relation.sideOne.referenceTable.metadata.relationshipKeys.push(relation);
        }

        if (!relation.sideTwo.referenceTable.metadata.relationshipKeys.includes(relation)) {
          relation.sideTwo.referenceTable.metadata.relationshipKeys.push(relation);
        }
      })
    }

  }
}
