import { BoatManager } from "./boatManager";
import { PersonManager } from "./persons"; // Adjusted the path to the correct location

export class DataAccessObject {
    public boatManager: BoatManager;
    public personManager: PersonManager;

    constructor() {
        // Initialize the boat manager and person manager
        this.boatManager = new BoatManager();
        this.personManager = new PersonManager();
        this.initialize();
    }
    public async initialize(): Promise<void> {
        try {
            await this.boatManager.initialize();
            //await this.personManager.initialize();
            console.log('DAO initialized successfully');
        } catch (error) {
            console.error('Error initializing DAO:', error);
        }
    }
}

export const dao = new DataAccessObject();