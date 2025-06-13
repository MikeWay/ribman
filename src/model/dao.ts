import { BoatManager } from "./boats";
import { PersonManager } from "./persons"; // Adjusted the path to the correct location

export class DataAccessObject {
    public boatManager: { [key: string]: any } = new BoatManager();
    public personManager: { [key: string]: any } = new PersonManager();
}

export const dao = new DataAccessObject();