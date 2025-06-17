

export class Boat {
    id: string = '';
    name: string = '';
    isAvailable: boolean = true;
    checkedOutTo: string | null = null;
    checkedOutAt: Date | null = null;
    checkedInAt: Date | null = null;
    constructor(id?: string, name?: string, isAvailable: boolean = true) {
        this.id = id ?? '';
        this.name = name ?? '';
        this.isAvailable = isAvailable;
        }
// export class Boat {


    toString(): string {
        return `Boat ID: ${this.id}, Name: ${this.name}, Available: ${this.isAvailable}`;
    }

    toItem(): { id: string; name: string; isAvailable: boolean } {
        return {
          id: this.id,
          name: this.name,
          isAvailable: this.isAvailable,
        };
      }
}
