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
            expect(commandArg.input.FilterExpression).toEqual('boatId = :boatId');
        });

        it('should return DefectsForBoat when Item is present', async () => {

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
            mockSend.mockResolvedValueOnce({ Items: [mockDefectsForBoat] });

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
        describe('DefectManager.loadDefectsForBoat (ScanCommand version)', () => {
            let defectManager: DefectManager;
            let mockSend: jest.Mock;

            beforeEach(() => {
                jest.clearAllMocks();
                defectManager = new DefectManager();
                // @ts-ignore
                mockSend = require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from().send;
            });

            it('should send a ScanCommand with correct parameters', async () => {
                mockSend.mockResolvedValueOnce({ Items: [] });
                const boatId = 'boat456';
                await defectManager.loadDefectsForBoat(boatId);
                expect(mockSend).toHaveBeenCalled();
                const commandArg = mockSend.mock.calls[0][0];
                expect(commandArg.input.TableName).toEqual(expect.any(String));
                expect(commandArg.input.FilterExpression).toBe('boatId = :boatId');
                expect(commandArg.input.ExpressionAttributeValues).toEqual({ ':boatId': boatId });
            });

            it('should return DefectsForBoat when Items array has one item', async () => {
                const mockItem = {
                    defects: [{ id: 2, description: 'Leaky hull', name: 'Hull' }],
                    boatId: 'boat456',
                    additionalInfo: 'Needs patching',
                    timestamp: 987654321
                };
                mockSend.mockResolvedValueOnce({ Items: [mockItem] });
                const result = await defectManager.loadDefectsForBoat('boat456');
                expect(result).not.toBeNull();
                if (result) {
                    expect(result.boatId).toBe('boat456');
                    expect(result.defects).toEqual([{ id: 2, description: 'Leaky hull', name: 'Hull' }]);
                    expect(result.additionalInfo).toBe('Needs patching');
                    expect(result.timestamp).toBe(987654321);
                }
            });

            it('should return null when Items array is empty', async () => {
                mockSend.mockResolvedValueOnce({ Items: [] });
                const result = await defectManager.loadDefectsForBoat('boat789');
                expect(result).toBeNull();
            });

            it('should parse timestamp as number if present, otherwise use Date.now()', async () => {
                const now = Date.now();
                jest.spyOn(Date, 'now').mockReturnValue(now);
                const mockItem = {
                    defects: [{ id: 3, description: 'Broken mast', name: 'Mast' }],
                    boatId: 'boat999',
                    additionalInfo: 'Replace mast',
                    // timestamp missing
                };
                mockSend.mockResolvedValueOnce({ Items: [mockItem] });
                const result = await defectManager.loadDefectsForBoat('boat999');
                expect(result).not.toBeNull();
                if (result) {
                    expect(result.timestamp).toBe(now);
                }
                (Date.now as jest.Mock).mockRestore();
            });
        });
    });
    
});