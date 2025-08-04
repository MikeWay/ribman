import { Boat } from "./Boat";
import { BoatManager } from "./BoatManager";
import { DefectsForBoat, DefectType } from "./defect";
import { LogEntry } from "./log";
import { LogManager, logManager } from "./LogManager";
import { Person } from "./Person";
import { PersonManager } from "./PersonManager"; // Adjusted the path to the correct location
import { DefectManager } from "./DefectManager";

export class DataAccessObject {

    public boatManager: BoatManager;
    public personManager: PersonManager;
    public logManager: LogManager; // Placeholder for LogManager, adjust as needed
    public defectManager: DefectManager;
    constructor() {
        // Initialize the boat manager and person manager
        this.boatManager = new BoatManager();
        this.personManager = new PersonManager();
        this.logManager = logManager;
        this.defectManager = new DefectManager();
        //this.initialize();
    }
    
    // public async initialize(): Promise<void> {
    //     try {
    //         await this.boatManager.initialize();
    //         //await this.personManager.initialize();
    //         console.log('DAO initialized successfully');
    //     } catch (error) {
    //         console.error('Error initializing DAO:', error);
    //     }
    // }

    public async checkInBoat(boat: Boat, checkInByUser: Person, defects: DefectType[], additionalInfo?: string): Promise<void>    {
        if (!boat || !checkInByUser) {
            throw new Error("Boat and user must be provided for check-in.");
        }
        const checkInDateTime = new Date().getTime(); // Current timestamp
        // Create a log entry for the check-in
        const logEntry = new LogEntry({
            boatName: boat.name,
            personName: checkInByUser.firstName + " " + checkInByUser.lastName,
            checkInDateTime: checkInDateTime,
            defect: defects.map(d => d.name).join(', '), // Join defect names into a string
            additionalInfo: additionalInfo || '',
            logKey: `${boat.name}-${new Date().toISOString()}`
        });

        // Save the log entry
        this.logManager.saveLogEntry(logEntry);

        // Update the boat's status to available
        boat.isAvailable = true;

        // Save the defects to dynamodb
        const defectsForBoat = new DefectsForBoat(defects,  boat.id, additionalInfo, checkInDateTime);
        await this.defectManager.saveDefectsForBoat(defectsForBoat);

        // Save the updated boat
        return this.boatManager.saveBoat(boat);
      throw new Error("Method not implemented.");
    }    

    public getPossibleDefectsList(): DefectType[] {
        return [
            new DefectType(1, 'Engine failure', 'The engine is not starting'),
            new DefectType(2, 'Electrical issue', 'There is a problem with the electrical system'),
            new DefectType(3, 'Hull damage', 'The hull is damaged'),
            new DefectType(4, 'Propeller problem', 'The propeller is not functioning'),
            new DefectType(5, 'Fuel system issue', 'There is a problem with the fuel system'),
            new DefectType(6, 'Steering malfunction', 'The steering is not working properly'),
            new DefectType(7, 'Navigation system failure', 'The navigation system is not working'),
            new DefectType(8, 'Safety equipment missing', 'Safety equipment is not on board'),
            new DefectType(9, 'Weather-related issues', 'Weather conditions are affecting the boat')
        ];
    }
}

export const dao = new DataAccessObject();