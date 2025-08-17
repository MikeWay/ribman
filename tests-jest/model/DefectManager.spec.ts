import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import sinon from 'sinon';
import { DefectManager } from '../../src/model/DefectManager';

jest.mock('@aws-sdk/lib-dynamodb', () => {
    const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
    return {
        ...actual,
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn(),
            }),
        },
        //PutCommand: jest.fn(),
        GetCommand: jest.fn(),
    };
});

jest.mock('@aws-sdk/util-dynamodb', () => ({
    unmarshall: jest.fn((item) => item),
}));

describe('DefectManager', () => {
    let defectManager: DefectManager;
    let mockSend: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        defectManager = new DefectManager();
        // Get the mock send function from the DynamoDBDocumentClient mock
        mockSend = (
            // @ts-ignore
            require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from().send
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('saveDefectsForBoat', () => {
        it('should send a PutCommand with correct parameters', async () => {
            const mockDefectsForBoat = {
                boatId: 'boat123',
                defects: [{ id: 1, description: 'Broken rudder', name: '' }],
                additionalInfo: 'Urgent repair needed',
                timestamp: 1234567890,
                toItem: function () {
                    return {
                        boatId: this.boatId,
                        defects: this.defects,
                        additionalInfo: this.additionalInfo,
                        timestamp: this.timestamp
                    };
                }
            };

            //ddbDocClientStub.resolves();

            await defectManager.saveDefectsForBoat(mockDefectsForBoat);
            expect(mockSend).toHaveBeenCalled();
            const commandArg = mockSend.mock.calls[0][0];
            expect(commandArg.input.TableName).toEqual(expect.any(String));
            expect(commandArg.input.Item).toEqual(mockDefectsForBoat.toItem());
        });
    });

    describe('loadDefectsForBoat', () => {
        it('should send a GetItemCommand with correct parameters', async () => {
            const boatId = 'boat123';
            
            mockSend.mockResolvedValueOnce({ Item: null });
            await defectManager.loadDefectsForBoat(boatId);          
            expect(mockSend).toHaveBeenCalled();
            const commandArg = mockSend.mock.calls[0][0];
            expect(commandArg.input.TableName).toEqual(expect.any(String));
            expect(commandArg.input.Key).toEqual({ boatId: { S: boatId } });
        });

        it('should return DefectsForBoat when Item is present', async () => {
            const mockItem = {
                defects: { S: JSON.stringify([{ id: 1, description: 'Broken rudder', name: '' }]) },
                boatId: { S: 'boat123' },
                additionalInfo: { S: 'Urgent repair needed' },
                timestamp: { N: '1234567890' }
            };
            mockSend.mockResolvedValueOnce({ Item: mockItem });

            const result = await defectManager.loadDefectsForBoat('boat123');
            expect(result).not.toBeNull();
            if (result) {
                expect(result.boatId).toEqual('boat123');
                expect(result.defects).toEqual([{ id: 1, description: 'Broken rudder', name: '' }]);
                expect(result.additionalInfo).toEqual('Urgent repair needed');
                expect(result.timestamp).toEqual(1234567890);
            }
        });

        it('should return null when Item is not present', async () => {

            mockSend.mockResolvedValueOnce({ Item: null });

            const result = await defectManager.loadDefectsForBoat('boat123');
            expect(result).toBeNull();
        });

    });
    
});