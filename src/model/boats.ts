import { Boat } from "./Boat";
import {
    DynamoDBClient,
    ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
} from '@aws-sdk/lib-dynamodb';

const REGION = 'eu-west-1'; // update as needed
const TABLE_NAME = 'Boats'; // update as needed

export class BoatManager {
    private boats: Boat[] = [
        new Boat({ id: '1', name: 'Blue Rib', isAvailable: true }),
        new Boat({ id: '2', name: 'Grey Rib', isAvailable: true }),
        new Boat({ id: '3', name: 'Spare Rib', isAvailable: true }),
        new Boat({ id: '4', name: 'Tornado II', isAvailable: true }),
        new Boat({ id: '5', name: 'Yellow Rib', isAvailable: true })
        // { id: '2', name: 'Grey Rib', isAvailable: true },
        // { id: '3', name: 'Spare Rib', isAvailable: true },
        // { id: '4', name: 'Tornado II', isAvailable: true },
        // { id: '5', name: 'Yellow Rib', isAvailable: true },

    ];


    private client = new DynamoDBClient({ region: REGION });
    private ddbDocClient = DynamoDBDocumentClient.from(this.client);

    private async saveAllBoats(): Promise<void> {
        for (const boat of this.boats) {
            try {
                await this.saveBoat(boat);
            } catch (err) {
                console.error(`Error saving boat with ID ${boat.id}:`, err);
            }
        }
    }
    
    async saveBoat(boat: Boat): Promise<void> {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: boat.toItem(),
      });
    
      try {
        await this.ddbDocClient.send(command);
        console.log(`Boat ${boat.name} saved to DynamoDB`);
      } catch (err) {
        console.error('Error saving boat:', err);
        throw err;
      }
    }
    addBoat(boat: Boat): void {
        this.boats.push(boat);
    }

    async ensureBoatsLoaded(): Promise<void> {
        if (this.boats.length === 0) {
            console.log('No boats available, fetching from DynamoDB...');
            try {
                this.boats = await this.listBoats();
                console.log(`Loaded ${this.boats.length} boats from DynamoDB`);
            } catch (err) {
                console.error('Error fetching boats from DynamoDB:', err);
            }
        }
    }

    async getAvailableBoats(): Promise<Boat[]> {
        // Return a list of available boats by calling listBoats
        await this.ensureBoatsLoaded();
        return this.boats.filter(boat => boat.isAvailable);
    }

    async getCheckedOutBoats(): Promise<Boat[]> {
                // Return a list of checked out boats by calling listBoats
        await this.ensureBoatsLoaded();
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

    private async listBoats(): Promise<Boat[]> {
        const command = new ScanCommand({
          TableName: TABLE_NAME,
        });
      
        try {
          const result = await this.ddbDocClient.send(command);
          return (result.Items || []).map((item) => new Boat(item  as Partial<Boat>));
        } catch (err) {
          console.error('❌ Error listing boats:', err);
          throw err;
        }
      }

    async initialize(): Promise<void> {
        try {
            const boats = await this.listBoats();
            if (boats.length === 0) {
                console.log('No boats found in DynamoDB, saving initial boats...');
                await this.saveAllBoats();
            } else {
                this.boats = boats;
                console.log(`Loaded ${this.boats.length} boats from DynamoDB`);
            }
        } catch (err) {
            console.error('❌ Error initializing BoatManager:', err);
        }       
}
}

/*
import {
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Boat } from '../models/Boat';

const REGION = 'us-east-1'; // update as needed
const TABLE_NAME = 'Boats'; // update as needed

const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function saveBoat(boat: Boat): Promise<void> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: boat.toItem(),
  });

  try {
    await ddbDocClient.send(command);
    console.log(`✅ Boat ${boat.name} saved to DynamoDB`);
  } catch (err) {
    console.error('❌ Error saving boat:', err);
    throw err;
  }
}
  */