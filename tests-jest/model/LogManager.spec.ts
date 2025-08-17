import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { LogManager } from '../../src/model/LogManager';

jest.mock('@aws-sdk/lib-dynamodb', () => {
    const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
    return {
        ...actual,
        DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn(),
            }),
        },
        PutCommand: jest.fn(),
        GetCommand: jest.fn(),

    };
});




jest.mock('@aws-sdk/util-dynamodb', () => ({
    unmarshall: jest.fn((item) => item),
}));

describe('LogManager', () => {
    let manager: LogManager;
    let mockSend: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        manager = new LogManager();
        // Get the mock send function from the DynamoDBDocumentClient mock
        mockSend = (
            // @ts-ignore
            require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from().send
        );
    });

    describe('LogManager.saveLogEntry', () => {
        it('should call PutCommand with correct parameters and send the command', async () => {
            const logEntry = {
                toItem: jest.fn().mockReturnValue({ logKey: 'key1', foo: 'bar' }),
            } as any;
            const manager = new LogManager();

            await manager.saveLogEntry(logEntry);

            expect(PutCommand).toHaveBeenCalledWith({
                TableName: expect.any(String),
                Item: { logKey: 'key1', foo: 'bar' },
                ConditionExpression: 'attribute_not_exists(logKey)',
            });
            expect(mockSend).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should throw error if send fails', async () => {
            const logEntry = {
                toItem: jest.fn().mockReturnValue({ logKey: 'key2' }),
            } as any;
            const manager = new LogManager();
            mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

            await expect(manager.saveLogEntry(logEntry)).rejects.toThrow('Failed to save log entry');
        });
    });

    describe('LogManager.listLogEntries', () => {
        it('should scan and return sorted LogEntry instances', async () => {
            const manager = new LogManager();
            const items = [
                { logKey: 'a', checkOutDateTime: 2 },
                { logKey: 'b', checkOutDateTime: 1 },
            ];
            mockSend.mockResolvedValueOnce({ Items: items });

            // Mock LogEntry constructor
            const LogEntry = jest.fn(function (item) {
                Object.assign(this, item);
            });
            jest.mock('../../src/model/log', () => ({
                LogEntry,
            }));

            const result = await manager.listLogEntries();

            expect(mockSend).toHaveBeenCalledWith(expect.any(Object));
            expect(result).toHaveLength(2);
            expect(result[0].checkOutDateTime).toBe(1);
            expect(result[1].checkOutDateTime).toBe(2);
        });

        it('should return empty array if no items', async () => {
            const manager = new LogManager();
            mockSend.mockResolvedValueOnce({});

            const result = await manager.listLogEntries();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });
    });
});