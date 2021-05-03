import { Connection } from "./connections";
export default class Config {
    private static __defaultConnection;
    static get defaultConnection(): Connection;
}
