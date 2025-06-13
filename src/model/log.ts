import { Defect } from "./defect";

export class LogEntry {
    boatName: string;
    personName: string;
    checkOutDateTime: Date;
    defect: Defect;

    constructor(boatName: string, personName: string, checkOutDateTime: Date, defect: Defect) {
        this.boatName = boatName;
        this.personName = personName;
        this.checkOutDateTime = checkOutDateTime;
        this.defect= defect;
    }
}