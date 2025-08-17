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
});