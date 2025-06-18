import { LogEntry } from "./log";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Config } from '../model/Config';
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const LOG_TABLE_NAME = Config.getInstance().get('LOG_TABLE_NAME');
const REGION = Config.getInstance().get('region');
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);


export class LogManager {

    // function to save a LogEntry object to DynamoDB
    public async saveLogEntry(logEntry: LogEntry): Promise<void> {
        try {
            const command = new PutCommand({
                TableName: LOG_TABLE_NAME,
                Item: logEntry.toItem(),
                ConditionExpression: 'attribute_not_exists(logKey)', // Ensure logKey is unique
            });

            await docClient.send(command);
            console.log('Log entry saved successfully:', logEntry);
        } catch (error) {
            console.error('Error saving log entry:', error);
            throw new Error('Failed to save log entry');
        }
    }
}

export const logManager = new LogManager();
