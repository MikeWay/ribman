import { BoatManager } from './BoatManager';
import { Boat } from './Boat';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/util-dynamodb', () => ({
  unmarshall: jest.fn(),
}));

describe('BoatManager - listBoats', () => {
  let boatManager: BoatManager;
  let mockSend: jest.Mock;

  beforeEach(() => {
    boatManager = new BoatManager();
    mockSend = jest.fn();
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: mockSend,
    });
    (unmarshall as jest.Mock).mockImplementation((item) => item);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of Boat instances when DynamoDB returns items', async () => {
    const dynamoItems = [
      { id: '1', name: 'Blue Rib', isAvailable: true },
      { id: '2', name: 'Grey Rib', isAvailable: false },
    ];
    mockSend.mockResolvedValueOnce({
      Count: 2,
      Items: dynamoItems,
    });

    const boats = await (boatManager as any).listBoats();

    expect(mockSend).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(Array.isArray(boats)).toBe(true);
    expect(boats.length).toBe(2);
    expect(boats[0]).toBeInstanceOf(Boat);
    expect(boats[0].id).toBe('1');
    expect(boats[1].isAvailable).toBe(false);
  });

  it('should return an empty array if DynamoDB returns no items', async () => {
    mockSend.mockResolvedValueOnce({
      Count: 0,
      Items: [],
    });

    const boats = await (boatManager as any).listBoats();

    expect(Array.isArray(boats)).toBe(true);
    expect(boats.length).toBe(0);
  });

  it('should return an empty array and warn if Items is not an array', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockSend.mockResolvedValueOnce({
      Count: 1,
      Items: null,
    });

    const boats = await (boatManager as any).listBoats();

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(Array.isArray(boats)).toBe(true);
    expect(boats.length).toBe(0);
    consoleWarnSpy.mockRestore();
  });

  it('should throw and log error if DynamoDB send fails', async () => {
    const error = new Error('DynamoDB error');
    mockSend.mockRejectedValueOnce(error);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await expect((boatManager as any).listBoats()).rejects.toThrow('DynamoDB error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error listing boats:', error);

    consoleErrorSpy.mockRestore();
  });
});