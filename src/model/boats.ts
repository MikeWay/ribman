export interface Boat {
    id: string;
    name: string;
    isAvailable: boolean;
}

export class BoatManager {
    private boats: Boat[] = [
        { id: '1', name: 'Blue Rib', isAvailable: true },
        { id: '2', name: 'Grey Rib', isAvailable: true },
        { id: '3', name: 'Spare Rib', isAvailable: true },
        { id: '4', name: 'Tornado II', isAvailable: true },
        // Add more boats as needed
        { id: '5', name: 'Yellow Rib', isAvailable: true },


    ];
    addBoat(boat: Boat): void {
        this.boats.push(boat);
    }

    getAvailableBoats(): Boat[] {
        return this.boats.filter(boat => boat.isAvailable);
    }

    getCheckedOutBoats(): Boat[] {
        return this.boats.filter(boat => !boat.isAvailable);
    }

    checkOutBoat(id: string): boolean {
        const boat = this.boats.find(boat => boat.id === id);
        if (boat && boat.isAvailable) {
            boat.isAvailable = false;
            return true;
        }
        return false;
    }

    getBoatById(id: string): Boat | undefined {
        if (!id) {
            return undefined;
        }
        return this.boats.find(boat => boat.id === id);
    }
}