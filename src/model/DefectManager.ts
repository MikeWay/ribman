import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DefectsForBoat, DefectType } from "./defect";

import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Config } from "./Config";
import { environment } from "../environment";

const TABLE_NAME = environment.DEFECTS_TABLE_NAME; // update as needed
const REGION = Config.getInstance().get('region');

export class DefectManager {

    private client = new DynamoDBClient({ region: REGION });
    private ddbDocClient = DynamoDBDocumentClient.from(this.client);
  
    public async saveDefectsForBoat(defectsForBoat: DefectsForBoat): Promise<void> {
        // Implement the logic to save defects for a specific boat



        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: defectsForBoat.toItem(), // Assuming DefectsForBoat has a toItem() method that returns the item structure
        });
        await this.ddbDocClient.send(command);
    }

    // load defects for a specific boatexpect.any(QueryCommand)
    public async loadDefectsForBoat(boatId: string): Promise<DefectsForBoat | null> {
        // const command = new GetItemCommand({
        //     TableName: TABLE_NAME,
        //     Key: {
        //         boatId: { S: boatId }
        //     }
        // });

        const scanCommand = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "boatId = :boatId",
            ExpressionAttributeValues: {
                ":boatId": boatId
            }
        });
        const scanResult = await this.ddbDocClient.send(scanCommand);
        if (scanResult.Items && scanResult.Items.length > 0) {
            const item = scanResult.Items[0];
            return new DefectsForBoat(
                item.defects,
                item.boatId ?? "",
                item.additionalInfo ?? "",
                item.timestamp ? parseInt(item.timestamp) : Date.now()
            );
        }
        return null;

        // const result = await this.ddbDocClient.send(command);
        // if (result.Item) {
        //     return new DefectsForBoat(
        //         JSON.parse(result.Item.defects.S ?? "[]"),
        //         result.Item.boatId.S ?? "",
        //         result.Item.additionalInfo?.S ?? "",
        //         result.Item.timestamp?.N ? parseInt(result.Item.timestamp.N) : Date.now()
        //     );
        // }
        // return null;
    }
}

      


    // (async () => {
    //     console.log("DefectManager example running...");
    //     const manager = new DefectManager();
    
    //     // Example: Save defects for a boat
    //     await manager.saveDefectsForBoat({
    //         boatId: "boat123",
    //         defects: [{
    //             id: 1, description: "Broken rudder",
    //             name: ""
    //         }],
    //         additionalInfo: "Urgent repair needed",
    //         timestamp: Date.now(),
    //         toItem: function (): { defects: DefectType[]; boatId: string; additionalInfo?: string; timestamp: number; } {
    //             return {
    //                 defects: this.defects,
    //                 boatId: this.boatId,
    //                 additionalInfo: this.additionalInfo,expect.any(QueryCommand)
    //                 timestamp: this.timestamp
    //             };
    //         }
    //     });
    
    //     // Example: Load defects for a boat
    //     //const defects = await manager.loadDefectsForBoat("boat123");
    //     //console.log(defects);
    // })();


