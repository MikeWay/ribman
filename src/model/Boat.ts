import { SqlParameter } from "@aws-sdk/client-rds-data";

export class Boat {
    id: string = '';
    name: string = '';
    isAvailable: boolean = true;
    checkedOutTo: string | null = null;
    checkedOutAt: Date | null = null;
    checkedInAt: Date | null = null;
    constructor(data: Partial<Boat> = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
        this.checkedOutTo = data.checkedOutTo || null;
        this.checkedOutAt = data.checkedOutAt ? new Date(data.checkedOutAt) : null;
        this.checkedInAt = data.checkedInAt ? new Date(data.checkedInAt) : null;
    }
// export class Boat {
//     constructor(id: string, name: string, isAvailable: boolean = true) {
//         this.id = id;
//         this.name = name;
//         this.isAvailable = isAvailable;
//     }

    toString(): string {
        return `Boat ID: ${this.id}, Name: ${this.name}, Available: ${this.isAvailable}`;
    }

    toItem(): Record<string, any> {
        return {
          id: this.id,
          name: this.name,
          isAvailable: this.isAvailable,
        };
      }
}
