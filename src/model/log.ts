import { Defect } from "./defect";

export class LogEntry {
    logKey: string; // Optional, can be used for unique identification
    boatName?: string;
    boatId?: string;
    personName?: string;
    checkOutDateTime?: Date;
    checkInDateTime?: Date;
    checkOutReason?: string;
    defect?: Defect | null;

    constructor(init: Partial<LogEntry>) {
        Object.assign(this, init);
        this.logKey = init.logKey ?? `${init.boatName}-${new Date().toISOString()}`;
        if(this.checkOutDateTime && typeof this.checkOutDateTime === 'string') {
            // Convert string to Date if necessary
            this.checkOutDateTime = new Date(this.checkOutDateTime as unknown as string);
        }
        if(init.checkInDateTime && typeof init.checkInDateTime === 'string') {
            this.checkInDateTime = new Date(init.checkInDateTime as unknown as string);
        }
    }

    // constructor(boatName: string, checkOutDateTime: Date, defect: Defect | null) {
    //     // Initialize the properties of the LogEntry
    //     this.logKey = `${boatName}-${new Date().toISOString()}`;
    //     this.boatName = boatName;
    //     this.checkOutDateTime = checkOutDateTime;
    //     this.defect = defect;
    // }

    public toItem(): {
        logKey: string;
        boatName: string;
        personName: string;
        checkOutDateTime?: number;
        checkInDateTime?: number;
        checkOutReason?: string;
        defect: string;
    } {
        return {
            logKey: this.logKey,
            boatName: this.boatName ?? "",
            personName: this.personName ?? "",
            checkOutDateTime: this.checkOutDateTime?.getTime(),
            checkInDateTime: this.checkInDateTime?.getTime(),
            checkOutReason: this.checkOutReason?this.checkOutReason : "",
            defect: ""
        };
    }
    public toString(): string {
        return `LogEntry: Boat Name: ${this.boatName}, Person Name: ${this.personName}, 
        Check Out DateTime: ${this.checkOutDateTime}, Check In DateTime: ${this.checkInDateTime}, 
        Check Out Reason: ${this.checkOutReason}, Defect: ${this.defect? this.defect.description: 'No Defect'}`;
    }

}