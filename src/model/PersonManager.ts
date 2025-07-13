// Person Manager loads a list of persons and provides methods to access them

// class PersonManager {

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { NumberValue, unmarshall } from '@aws-sdk/util-dynamodb';
import { Person } from './Person';
import { Config } from './Config';


const TABLE_NAME = 'Boat_Users'; // update as needed
const REGION = Config.getInstance().get('region');

export class PersonManager {
    private client = new DynamoDBClient({ region: REGION });

    public setClient(client: DynamoDBClient): void {
        this.client = client;
        this.ddbDocClient = DynamoDBDocumentClient.from(this.client);
    }
      
      private ddbDocClient = DynamoDBDocumentClient.from(this.client);


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

    // method to load all persons from the database
    async loadAllPersons(): Promise<Person[]> {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
        });

        try {
            const response = await this.ddbDocClient.send(command);
            if (!response.Items) {
                return [];
            }
            return response.Items.map(item => Person.fromItem(unmarshall(item) as Person));

        } catch (err: unknown) {
            console.error('Error loading persons from DynamoDB:', err);
            throw err;
        }
    }

    // method to get a person by first letter of their last name , there day of birth and month of birth
    async getPersonByLastNameAndBirthDate(
        firstLetter: string,
        birthDay: number,
        birthMonth: number
    ): Promise<Person | null> {
        firstLetter = firstLetter.toLowerCase();

        const searchPerson = new Person('0', '', firstLetter, birthDay, birthMonth); // Create a dummy person to use the toItem method

        // construct a Person search key
        if (!firstLetter || !birthDay || !birthMonth) {
            console.error('Invalid parameters for getPersonByLastNameAndBirthDate:', { firstLetter, birthDay, birthMonth });
            throw new Error('Invalid parameters');

        }  

        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'search_key = :searchKey',
            ExpressionAttributeValues: {
                ':searchKey': { S: searchPerson.searchKey! }
            }
        });

        try {
            const response = await this.ddbDocClient.send(command);
            if (response.Items && response.Items.length > 0) {
                return Person.fromItem(unmarshall(response.Items[0]) as Person);
            }
            return null;
        } catch (err: unknown) {
            console.error('Error getting person by last name and birth date:', err);
            throw err;
        }
    }   
}
export const personManager = new PersonManager();


