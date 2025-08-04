import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DefectsForBoat } from "./defect";

export class DefectManager {
    public async saveDefectsForBoat(defectsForBoat: DefectsForBoat): Promise<void> {
        // Implement the logic to save defects for a specific boat
        const client = new DynamoDBClient({ region: "us-east-1" });

        const params = {
            TableName: "DefectsForBoats",
            Item: {
                boatId: { S: defectsForBoat.boatId },
                defects: { S: JSON.stringify(defectsForBoat.defects) }
            }
        };

        await client.send(new PutItemCommand(params));
    }

    // load defects for a specific boat
    public async loadDefectsForBoat(boatId: string): Promise<DefectsForBoat | null> {
        const client = new DynamoDBClient({ region: "us-east-1" });

        const params = {
            TableName: "DefectsForBoats",
            Key: {
                boatId: { S: boatId }
            }
        };

        const result = await client.send(new GetItemCommand(params));
        if (result.Item) {
            return new DefectsForBoat(
                JSON.parse(result.Item.defects.S ?? "[]"),
                result.Item.boatId.S ?? "",
                result.Item.additionalInfo?.S ?? "",
                result.Item.timestamp?.N ? parseInt(result.Item.timestamp.N) : Date.now()
            );
        }
        return null;
    }
}
