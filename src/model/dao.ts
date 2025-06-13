import { BoatManager } from "./boats";

export class DataAccessObject {
    public boatManager: { [key: string]: any } = new BoatManager();
}

export const dao = new DataAccessObject();