// Person Manager loads a list of persons and provides methods to access them

// class PersonManager {

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Person } from './Person';
import { Config } from './Config';


const TABLE_NAME = 'Boats'; // update as needed
const REGION = Config.getInstance().get('region');

export class PersonManager {
    private client = new DynamoDBClient({ region: REGION });

    public setClient(client: DynamoDBClient): void {
        this.client = client;
        this.ddbDocClient = DynamoDBDocumentClient.from(this.client);
    }
      
      private ddbDocClient = DynamoDBDocumentClient.from(this.client);


    // private persons: Person[] = [
    //     new Person('1', 'Alice Smith', 'x@y.com'),
    //     new Person('2', 'Bob Johnson', 'b@y.com'),
    //     new Person('3', 'Charlie Brown', 'c@y.com')
    // ]; 
    // method to save a person to the database
    async savePerson(person: Person): Promise<void> {   
        if (!person || typeof person.toItem !== 'function') {
            console.error('Invalid person object provided to savePerson:', person);
            throw new Error('Invalid person object');
        }

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: person.toItem(),
        });

        try {
            await this.ddbDocClient.send(command);
            console.log(`Person ${person.firstName} ${person.lastName} saved to DynamoDB`);
        } catch (err: unknown) {
            console.error(`Error saving person with ID ${person.id}:`, err);
            throw err;
        }
    }   
}
export const personManager = new PersonManager();


