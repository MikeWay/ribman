import sinon from 'sinon';
import { BoatManager } from '../../src/model/BoatManager';
import { Boat } from '../../src/model/Boat';
import { Person } from '../../src/model/Person';


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

describe('BoatManager', () => {
  let manager: BoatManager;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new BoatManager();
    // Get the mock send function from the DynamoDBDocumentClient mock
    mockSend = (
      // @ts-ignore
      require('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient.from().send
    );
  });

  describe('saveBoat', () => {
    it('should save a valid boat', async () => {
      const boat = new Boat('1', 'Blue Rib', true);
      boat.toItem = jest.fn().mockReturnValue({ id: '1', name: 'Blue Rib', isAvailable: true });
      mockSend.mockResolvedValue({});
      await expect(manager.saveBoat(boat)).resolves.toBeUndefined();
      expect(mockSend).toHaveBeenCalled();
    });

    it('should throw error for invalid boat', async () => {
      await expect(manager.saveBoat(null as any)).rejects.toThrow('Invalid boat object');
    });

    it('should handle DynamoDB errors', async () => {
      const boat = new Boat('1', 'Blue Rib', true);
      boat.toItem = jest.fn().mockReturnValue({ id: '1', name: 'Blue Rib', isAvailable: true });
      mockSend.mockRejectedValue({ name: 'ResourceNotFoundException' });
      await expect(manager.saveBoat(boat)).rejects.toEqual({ name: 'ResourceNotFoundException' });
    });
  });

  describe('getAvailableBoats', () => {
    it('should return only available boats', async () => {
      const boats = [
        { id: '1', name: 'A', isAvailable: true },
        { id: '2', name: 'B', isAvailable: false },
      ];
      mockSend.mockResolvedValue({ Items: boats, Count: 2 });
      const result = await manager.getAvailableBoats();
      expect(result).toHaveLength(1);
      expect(result[0].isAvailable).toBe(true);
    });
  });

  describe('getCheckedOutBoats', () => {
    it('should return only checked out boats', async () => {
      const boats = [
        { id: '1', name: 'A', isAvailable: true },
        { id: '2', name: 'B', isAvailable: false },
      ];
      mockSend.mockResolvedValue({ Items: boats, Count: 2 });
      const result = await manager.getCheckedOutBoats();
      expect(result).toHaveLength(1);
      expect(result[0].isAvailable).toBe(false);
    });
  });

  describe('getBoatByName', () => {
    it('should return undefined if name is falsy', async () => {
      const result = await manager.getBoatByName('');
      expect(result).toBeUndefined();
    });

    it('should return undefined if boat not found', async () => {
      mockSend.mockResolvedValue({ Item: undefined });
      const result = await manager.getBoatByName('Nonexistent');
      expect(result).toBeUndefined();
    });

    it('should return a Boat if found', async () => {
      const item = { id: '1', name: 'Blue Rib', isAvailable: true };
      mockSend.mockResolvedValue({ Item: item });
      const result = await manager.getBoatByName('Blue Rib');
      expect(result).toBeInstanceOf(Boat);
      expect(result?.name).toBe('Blue Rib');
    });

    it('should throw on error', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      await expect(manager.getBoatByName('Blue Rib')).rejects.toThrow('fail');
    });
  });

  describe('checkOutBoat', () => {
    it('should throw if boat is invalid', async () => {
      await expect(manager.checkOutBoat(null as any, {} as Person, 'reason')).rejects.toThrow('Invalid boat object');
    });

    it('should throw if boat not found', async () => {
      jest.spyOn(manager, 'getBoatByName').mockResolvedValue(undefined);
      const boat = new Boat('1', 'Blue Rib', true);
      await expect(manager.checkOutBoat(boat, {} as Person, 'reason')).rejects.toThrow('Boat with name Blue Rib not found');
    });

    it('should return false if boat is not available', async () => {
      const boatObj = new Boat('1', 'Blue Rib', false);
      jest.spyOn(manager, 'getBoatByName').mockResolvedValue(boatObj);
      const boat = new Boat('1', 'Blue Rib', true);
      const result = await manager.checkOutBoat(boat, {} as Person, 'reason');
      expect(result).toBe(false);
    });

    it('should check out boat and return true', async () => {
      const user = { firstName: 'John', lastName: 'Doe' } as Person;
      const availableBoat = new Boat('1', 'Blue Rib', true);
      jest.spyOn(manager, 'getBoatByName')
        .mockResolvedValueOnce(availableBoat)
        .mockResolvedValueOnce(new Boat('1', 'Blue Rib', false));
      jest.spyOn(manager, 'saveBoat').mockResolvedValue();
      const boat = new Boat('1', 'Blue Rib', true);
      const result = await manager.checkOutBoat(boat, user, 'reason');
      expect(result).toBe(true);
    });
  });

  describe('checkInAllBoats', () => {
    it('should check in all checked out boats', async () => {
      const checkedOutBoat = new Boat('1', 'Blue Rib', false);
      const availableBoat = new Boat('2', 'Grey Rib', true);
      jest.spyOn(manager as any, 'listBoats').mockResolvedValue([checkedOutBoat, availableBoat]);
      jest.spyOn(manager, 'saveBoat').mockResolvedValue();
      await expect(manager.checkInAllBoats()).resolves.toBeUndefined();
      expect(manager.saveBoat).toHaveBeenCalledWith(expect.objectContaining({ name: 'Blue Rib', isAvailable: true }));
    });

    it('should not call saveBoat for available boats', async () => {
      jest.spyOn(manager as any, 'listBoats').mockResolvedValue([new Boat('2', 'Grey Rib', true)]);
      jest.spyOn(manager, 'saveBoat').mockResolvedValue();
      await manager.checkInAllBoats();
      expect(manager.saveBoat).not.toHaveBeenCalled();
    });

    it('should throw on error', async () => {
      jest.spyOn(manager as any, 'listBoats').mockRejectedValue(new Error('fail'));
      await expect(manager.checkInAllBoats()).rejects.toThrow('fail');
    });
  });
});