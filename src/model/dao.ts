import { BoatManager } from "./BoatManager";
import { LogManager, logManager } from "./LogManager";
import { PersonManager } from "./PersonManager"; // Adjusted the path to the correct location

export class DataAccessObject {
    public boatManager: BoatManager;
    public personManager: PersonManager;
    public logManager: LogManager; // Placeholder for LogManager, adjust as needed

    constructor() {
        // Initialize the boat manager and person manager
        this.boatManager = new BoatManager();
        this.personManager = new PersonManager();
        this.logManager = logManager;
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