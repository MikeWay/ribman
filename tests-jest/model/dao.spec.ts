import { DataAccessObject } from '../../src/model/dao';
import { Boat } from '../../src/model/Boat';
import { Person } from '../../src/model/Person';
import { DefectType, DefectsForBoat } from '../../src/model/defect';
import { BoatManager } from '../../src/model/BoatManager';
import { PersonManager } from '../../src/model/PersonManager';
import { LogManager } from '../../src/model/LogManager';
import { DefectManager } from '../../src/model/DefectManager';
import { AdminPersonManager } from '../../src/model/AdminPersonManager';

jest.mock('../../src/model/BoatManager');
jest.mock('../../src/model/PersonManager');
jest.mock('../../src/model/LogManager');
jest.mock('../../src/model/DefectManager');
jest.mock('../../src/model/AdminPersonManager');

describe('DataAccessObject', () => {
    let dao: DataAccessObject;
    let mockBoat: Boat;
    let mockPerson: Person;
    let mockDefects: DefectType[];

    beforeEach(() => {
        dao = new DataAccessObject();
        mockBoat = { id: 'boat1', isAvailable: false } as Boat;
        mockPerson = { id: 'person1' } as Person;
        mockDefects = [new DefectType(1, 'Engine failure', 'The engine is not starting')];

        (dao.boatManager.saveBoat as jest.Mock).mockResolvedValue(undefined);
        (dao.defectManager.saveDefectsForBoat as jest.Mock).mockResolvedValue(undefined);
    });

    describe('constructor', () => {
        it('should initialize managers', () => {
            expect(dao.boatManager).toBeInstanceOf(BoatManager);
            expect(dao.personManager).toBeInstanceOf(PersonManager);
            expect(dao.logManager).toBeInstanceOf(LogManager);
            expect(dao.defectManager).toBeInstanceOf(DefectManager);
            expect(dao.adminPersonManager).toBeInstanceOf(AdminPersonManager);
        });
    });

    describe('checkInBoat', () => {
        it('should throw error if boat or user is missing', async () => {
            await expect(dao.checkInBoat(undefined as any, mockPerson, mockDefects)).rejects.toThrow('Boat and user must be provided for check-in.');
            await expect(dao.checkInBoat(mockBoat, undefined as any, mockDefects)).rejects.toThrow('Boat and user must be provided for check-in.');
        });

        it('should update boat availability, save defects, and save boat', async () => {
            await dao.checkInBoat(mockBoat, mockPerson, mockDefects, 'info');
            expect(mockBoat.isAvailable).toBe(true);
            expect(dao.defectManager.saveDefectsForBoat).toHaveBeenCalledWith(expect.any(DefectsForBoat));
            expect(dao.boatManager.saveBoat).toHaveBeenCalledWith(expect.any(Boat));
        });
    });

    describe('getPossibleDefectsList', () => {
        it('should return list of possible defects', () => {
            const defects = dao.getPossibleDefectsList();
            expect(defects).toHaveLength(9);
            expect(defects[0]).toBeInstanceOf(DefectType);
            expect(defects[0].name).toBe('Engine failure');
        });
    });
describe('getBoatDefectStatus', () => {
    it('should throw error if boat is not found', async () => {
        (dao.boatManager.getBoatByName as jest.Mock).mockResolvedValue(null);
        await expect(dao.getBoatDefectStatus('NonExistentBoat')).rejects.toThrow('Boat with name NonExistentBoat not found');
    });

    it('should return defects for the found boat', async () => {
        const mockBoat = { id: 'boat123', name: 'TestBoat' } as Boat;
        const mockDefects = new DefectsForBoat([new DefectType(1, 'Engine failure', 'The engine is not starting')], mockBoat.id, 'info', Date.now());
        (dao.boatManager.getBoatByName as jest.Mock).mockResolvedValue(mockBoat);
        (dao.defectManager.loadDefectsForBoat as jest.Mock).mockResolvedValue(mockDefects);

        const result = await dao.getBoatDefectStatus('TestBoat');
        expect(result).toBe(mockDefects);
        expect(dao.boatManager.getBoatByName).toHaveBeenCalledWith('TestBoat');
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledWith(mockBoat.id);
    });

    it('should return null if no defects are found for the boat', async () => {
        const mockBoat = { id: 'boat456', name: 'BoatNoDefects' } as Boat;
        (dao.boatManager.getBoatByName as jest.Mock).mockResolvedValue(mockBoat);
        (dao.defectManager.loadDefectsForBoat as jest.Mock).mockResolvedValue(null);

        const result = await dao.getBoatDefectStatus('BoatNoDefects');
        expect(result).toBeNull();
        expect(dao.boatManager.getBoatByName).toHaveBeenCalledWith('BoatNoDefects');
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledWith(mockBoat.id);
    });
});
describe('identifyBoatsWithIssues', () => {
    it('should return boats that have defects', async () => {
        const boat1 = { id: 'boat1', name: 'Boat1' } as Boat;
        const boat2 = { id: 'boat2', name: 'Boat2' } as Boat;
        const boat3 = { id: 'boat3', name: 'Boat3' } as Boat;

        (dao.boatManager.listBoats as jest.Mock).mockResolvedValue([boat1, boat2, boat3]);
        (dao.defectManager.loadDefectsForBoat as jest.Mock)
            .mockResolvedValueOnce(new DefectsForBoat([new DefectType(1, 'Engine failure', 'desc')], boat1.id, '', Date.now()))
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(new DefectsForBoat([new DefectType(2, 'Hull damage', 'desc')], boat3.id, '', Date.now()));

        const result = await dao.identifyBoatsWithIssues();
        expect(result).toEqual([boat1, boat3]);
        expect(dao.boatManager.listBoats).toHaveBeenCalled();
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledTimes(3);
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledWith(boat1.id);
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledWith(boat2.id);
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledWith(boat3.id);
    });

    it('should return an empty array if no boats have defects', async () => {
        const boat1 = { id: 'boat1', name: 'Boat1' } as Boat;
        const boat2 = { id: 'boat2', name: 'Boat2' } as Boat;

        (dao.boatManager.listBoats as jest.Mock).mockResolvedValue([boat1, boat2]);
        (dao.defectManager.loadDefectsForBoat as jest.Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);

        const result = await dao.identifyBoatsWithIssues();
        expect(result).toEqual([]);
        expect(dao.boatManager.listBoats).toHaveBeenCalled();
        expect(dao.defectManager.loadDefectsForBoat).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array if there are no boats', async () => {
        (dao.boatManager.listBoats as jest.Mock).mockResolvedValue([]);
        const result = await dao.identifyBoatsWithIssues();
        expect(result).toEqual([]);
        expect(dao.boatManager.listBoats).toHaveBeenCalled();
        expect(dao.defectManager.loadDefectsForBoat).not.toHaveBeenCalled();
    });
});
});