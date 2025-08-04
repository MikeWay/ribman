
export class DefectType {
    id: number;
    name: string;
    description?: string;

    constructor(id: number, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}

export class DefectsForBoat {
    defects: DefectType[];
     boatId: string;
     additionalInfo?: string; // Optional additional information about the defects
     timestamp: number = Date.now(); // Optional timestamp for when the defects were recorded

    constructor(defects: DefectType[], boatId: string, additionalInfo?: string, timestamp?: number) {
        this.defects = defects;
        this.boatId = boatId;   // link to the boat with these defects
        this.additionalInfo = additionalInfo;
        this.timestamp = timestamp || Date.now(); // Set the timestamp to the current time
    }

    // helpers for saving to DynamoDB
    public toItem(): { defects: DefectType[], boatId: string, additionalInfo?: string, timestamp: number } {
        return {
            defects: this.defects,
            boatId: this.boatId,
            additionalInfo: this.additionalInfo,
            timestamp: this.timestamp
        };
    }


    // helper for creating from DynamoDB item
    public static fromItem(item: { defects: DefectType[], boatId: string, additionalInfo?: string, timestamp: number }): DefectsForBoat {
        return new DefectsForBoat(
            item.defects,
            item.boatId,
            item.additionalInfo,
            item.timestamp);
    }
}
