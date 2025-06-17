import { Boat } from "./Boat";
import {
  AttributeValue,
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
        new Boat('1', 'Blue Rib',true ),  // Example boat with id, name, and availability
        new Boat('2', 'Grey Rib', true),
        new Boat('3', 'Spare Rib', true),
        new Boat('4', 'Tornado II', true),
        new Boat('5', 'Yellow Rib', true),
        
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
      if (!boat || typeof boat.toItem !== 'function') {
      console.error('Invalid boat object provided to saveBoat:', boat);
      throw new Error('Invalid boat object');
      }

      const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: boat.toItem(),
      });

      try {
      await this.ddbDocClient.send(command);
      console.log(`Boat ${boat.name} saved to DynamoDB`);
      } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'name' in err) {
        const errorObj = err as { name?: string; message?: string };
        if (errorObj.name === 'ResourceNotFoundException') {
          console.error('DynamoDB table not found:', TABLE_NAME);
        } else if (errorObj.name === 'ValidationException') {
          console.error('Validation error saving boat:', errorObj.message);
        } else {
          console.error('Error saving boat:', err);
        }
      } else {
        console.error('Error saving boat:', err);
      }
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

    async checkOutBoat(id: string): Promise<boolean> {
        const boat = await this.getBoatById(id);
        if (boat && boat.isAvailable) {
            boat.isAvailable = false;
            return true;
        }
        return false;
    }

    async getBoatById(id: string): Promise<Boat | undefined> {
        await this.ensureBoatsLoaded();
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
          console.log(`✅ Fetched ${result.Count} boats from DynamoDB`);
          // Map the result to Boat instances
          if (!result.Items) {
            console.warn('No boats found in DynamoDB');
            return [];
          }
          // Ensure result.Items is an array before mapping
          console.log(`Boats fetched: ${JSON.stringify(result.Items)}`);
          if (!Array.isArray(result.Items)) {
            console.warn('Result items are not an array:', result.Items);
            return [];
          }
          return (result.Items || []).map((item) => new Boat(item.id?.S, item.name?.S, item.isAvailable?.BOOL ?? true));
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