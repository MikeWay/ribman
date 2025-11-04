import { EngineHours } from '../../src/model/EngineHours';

describe('EngineHours', () => {
    const boatId = 'boat123';
    const hours = 42;
    const reason = 'Routine maintenance';

    it('should create an instance with correct properties', () => {
        const engineHours = new EngineHours(boatId, hours, reason);
        expect(engineHours.boatId).toBe(boatId);
        expect(engineHours.hours).toBe(hours);
        expect(engineHours.reason).toBe(reason);
    });

    it('should convert to item object', () => {
        const engineHours = new EngineHours(boatId, hours, reason);
        const time = engineHours.timestamp;
        const item = engineHours.toItem();
        expect(item).toEqual({ boatId, hours, reason, timestamp: time });
    });

    it('should create an instance from item object', () => {
        const item = { boatId, hours, reason, timestamp: Date.now() };
        const engineHours = EngineHours.fromItem(item);
        expect(engineHours).toBeInstanceOf(EngineHours);
        expect(engineHours.boatId).toBe(boatId);
        expect(engineHours.hours).toBe(hours);
        expect(engineHours.reason).toBe(reason);
        expect(engineHours.timestamp).toBe(item.timestamp);
    });
});