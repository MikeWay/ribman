import { EngineHoursManager } from '../../src/model/EngineHoursManager';
import { EngineHours } from '../../src/model/EngineHours';
import { DynamoDBClient, QueryCommand,  } from "@aws-sdk/client-dynamodb";
import {  PutCommand } from "@aws-sdk/lib-dynamodb";


jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn(),
      }),
    },
    PutCommand: jest.fn().mockImplementation((params) => ({
      input: params,
    })),
    GetCommand: jest.fn(),

  };
});

jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn(),
    QueryCommand: jest.fn()
}));

describe('EngineHoursManager', () => {
    let manager: EngineHoursManager;
    let mockDynamoClient: jest.Mocked<DynamoDBClient>;
    let mockQueryCommand: jest.MockedClass<typeof QueryCommand>;
    let sendMock: jest.Mock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Create mocked DynamoDB client
        mockDynamoClient = {
            send: sendMock
        } as any;

        // Get reference to the mocked QueryCommand constructor
        mockQueryCommand = QueryCommand as jest.MockedClass<typeof QueryCommand>;

        manager = new EngineHoursManager();
        sendMock = manager['ddbDocClient'].send as jest.Mock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should save engine hours', async () => {
        sendMock.mockResolvedValue({});
        const engineHours = new EngineHours('boat-123', 100, '2024-06-01');

        await manager.saveEngineHours(engineHours);

        expect(sendMock).toHaveBeenCalled();
        const command: PutCommand = sendMock.mock.calls[0][0];
        expect(command.input.Item).toEqual(engineHours);
    });

    it('should get engine hours by boatId', async () => {
        const items = [
            { boatId: 'boat-123', hours: 100, date: '2024-06-01' },
            { boatId: 'boat-123', hours: 110, date: '2024-06-02' }
        ];
        sendMock.mockResolvedValue({ Items: items });

        const result = await manager.getEngineHoursByBoatId('boat-123');

        expect(sendMock).toHaveBeenCalled();
        const constructorArg = mockQueryCommand.mock.calls[0][0];
        expect(constructorArg.KeyConditionExpression).toBe('boatId = :boatId');
        expect(constructorArg.ExpressionAttributeValues).toEqual({ ':boatId': 'boat-123' });
        expect(result).toEqual(items);
    });

    it('should return empty array if no items found', async () => {
        sendMock.mockResolvedValue({ Items: undefined });

        const result = await manager.getEngineHoursByBoatId('boat-123');

        expect(result).toEqual([]);
    });

it('should load all engine hours for all boats', async () => {
    const items = [
        { boatId: 'boat-123', hours: 100, date: '2024-06-01', reason: 'Maintenance' },
        { boatId: 'boat-456', hours: 200, date: '2024-06-02', reason: 'Repair' }
    ];
    // Simulate DynamoDB ScanCommand response with marshalled items
    sendMock.mockResolvedValue({ Items: items });

    // Mock EngineHours.fromItem and unmarshall
    const fromItemSpy = jest.spyOn(EngineHours, 'fromItem').mockImplementation((item) => item as EngineHours);

    const result = await manager.loadAllEngineHoursForAllBoats();

    expect(sendMock).toHaveBeenCalled();
    expect(fromItemSpy).toHaveBeenCalledTimes(items.length);
    expect(result).toEqual(items);

    fromItemSpy.mockRestore();
});

it('should return empty array when loading all engine hours if no items found', async () => {
    sendMock.mockResolvedValue({ Items: undefined });

    const fromItemSpy = jest.spyOn(EngineHours, 'fromItem');

    const result = await manager.loadAllEngineHoursForAllBoats();

    expect(result).toEqual([]);
    expect(fromItemSpy).not.toHaveBeenCalled();

    fromItemSpy.mockRestore();
});

it('should sort engine hours by boatId', () => {
    const unsorted = [
        new EngineHours('boat-b', 100, 'Maintenance'),
        new EngineHours('boat-a', 200, 'Repair')
    ];

    const sorted = manager.sortEngineHoursByBoatId([...unsorted]);

    expect(sorted[0].boatId).toBe('boat-a');
    expect(sorted[1].boatId).toBe('boat-b');
});

it('should sort engine hours by reason', () => {
    const unsorted = [
        new EngineHours('boat-1', 100, 'Zebra'),
        new EngineHours('boat-2', 200, 'Alpha')
    ];

    const sorted = manager.sortEngineHoursByReason([...unsorted]);

    expect(sorted[0].reason).toBe('Alpha');
    expect(sorted[1].reason).toBe('Zebra');
});

it('should set reason to "Unknown" if empty when saving engine hours', async () => {
    sendMock.mockResolvedValue({});
    const engineHours = new EngineHours('boat-789', 50, '2024-06-03');
    engineHours.reason = "";

    await manager.saveEngineHours(engineHours);

    expect(sendMock).toHaveBeenCalled();
    const command: PutCommand = sendMock.mock.calls[0][0];
    expect(command.input.Item).toBeDefined();
    expect(command.input.Item!.reason).toBe('Unknown');
});
});
describe('mergeEngineHoursByReason', () => {
    let manager: EngineHoursManager;

    beforeEach(() => {
        manager = new EngineHoursManager();
    });

    it('should merge engine hours by reason', () => {
        const engineHours = [
            new EngineHours('boat-1', 10, 'Maintenance'),
            new EngineHours('boat-2', 20,  'Maintenance'),
            new EngineHours('boat-3', 15, 'Repair')
        ];

        const result = manager.mergeEngineHoursByReason(engineHours);

        expect(result.get('Maintenance')).toBe(30);
        expect(result.get('Repair')).toBe(15);
        expect(result.size).toBe(2);
    });

    it('should handle empty engine hours array', () => {
        const result = manager.mergeEngineHoursByReason([]);

        expect(result.size).toBe(0);
    });

    it('should handle engine hours with unique reasons', () => {
        const engineHours = [
            new EngineHours('boat-1', 5, 'A'),
            new EngineHours('boat-2', 7, 'B'),
            new EngineHours('boat-3', 9, 'C')
        ];

        const result = manager.mergeEngineHoursByReason(engineHours);

        expect(result.get('A')).toBe(5);
        expect(result.get('B')).toBe(7);
        expect(result.get('C')).toBe(9);
        expect(result.size).toBe(3);
    });

    it('should merge engine hours with empty reason', () => {
        const engineHours = [
            new EngineHours('boat-1', 5, ''),
            new EngineHours('boat-2', 7, ''),
            new EngineHours('boat-3', 9, '')
        ];

        const result = manager.mergeEngineHoursByReason(engineHours);

        expect(result.get('')).toBe(21);
        expect(result.size).toBe(1);
    });
});