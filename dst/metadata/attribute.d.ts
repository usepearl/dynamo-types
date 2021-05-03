export declare const enum Type {
    Buffer = "B",
    Boolean = "BOOL",
    String = "S",
    Null = "NULL",
    Number = "N",
    Array = "L",
    Map = "M"
}
export interface Metadata {
    name: string;
    propertyName: string;
    timeToLive: true | undefined;
    type: Type;
}
