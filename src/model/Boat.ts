

export class Boat {
    id: string = '';
    name: string = '';
    isAvailable: boolean = true;
    checkedOutTo: string | null = null;
    checkedOutAt: number | null = null;
    checkedInAt: number | null = null;
    checkOutReason: string | null = null;
    constructor(id?: string, name?: string, isAvailable: boolean = true) {
        this.id = id ?? '';
        this.name = name ?? '';
        this.isAvailable = isAvailable;
        }
// export class Boat {


    toString(): string {
        return `Boat ID: ${this.id}, Name: ${this.name}, Available: ${this.isAvailable}`;
    }

    toItem(): { id: string; name: string; isAvailable: boolean, checkedOutTo?: string | null, checkedOutAt?: number | null, checkedInAt?: number | null, checkOutReason?: string | null } {
        return {
          id: this.id,
          name: this.name,
          isAvailable: this.isAvailable,
          checkedOutTo: this.checkedOutTo,
          checkedOutAt: this.checkedOutAt,
          checkedInAt: this.checkedInAt,
          checkOutReason: this.checkOutReason,
        };
      }

    // Static method to create a Boat instance from a DynamoDB item
    static fromItem(item: {
        id: string,
        name: string,
        isAvailable: boolean,
        checkedOutTo?: string | null,
        checkedOutAt?: number | null,
        checkedInAt?: number | null,
        checkOutReason?: string | null  

    }): Boat {
        const boat = new Boat(
            item.id,
            item.name,
            item.isAvailable
        );
        boat.checkedOutTo = item.checkedOutTo ?? null;
        boat.checkedOutAt = item.checkedOutAt ?? null;
        boat.checkedInAt = item.checkedInAt ?? null;
        return boat;
    }
}


