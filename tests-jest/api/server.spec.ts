import { apiServer } from '../../src/api/server';
import { dao } from '../../src/model/dao';
import { Request, Response } from 'express';
import { Boat } from '../../src/model/Boat';
import { Person } from '../../src/model/Person';
import { DefectType } from '../../src/model/defect';
import { LogEntry } from '../../src/model/log';

describe('ApiServer', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = { body: {} };
        res = {
            status: statusMock,
            json: jsonMock,
            sendStatus: jest.fn()
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('checkPerson', () => {
        it('should return found people', async () => {
            const people = [new Person('1', 'John', 'Doe', 6, 12)];
            jest.spyOn(dao.personManager, 'getPersonByLastNameAndBirthDate').mockResolvedValue(people);

            req.body = { familyInitial: 'Doe', day: 1, month: 2, year: 2000 };
            await apiServer.checkPerson(req as Request, res as Response);

            expect(jsonMock).toHaveBeenCalledWith(people);
        });

        it('should handle errors', async () => {
            jest.spyOn(dao.personManager, 'getPersonByLastNameAndBirthDate').mockRejectedValue(new Error('fail'));
            await apiServer.checkPerson(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal server error' }));
        });
    });

    describe('checkInBoat', () => {
        it('should check in a boat and save log', async () => {
            const checkOutReason = 'Sailability';
            const checkInBoatSpy = jest.spyOn(dao, 'checkInBoat').mockResolvedValue(undefined);
            const saveLogEntrySpy = jest.spyOn(dao.logManager, 'saveLogEntry').mockResolvedValue(undefined);

            req.body = {
                boat: { name: 'Boat1', checkedOutAt: null, checkOutReason: checkOutReason } as Boat,
                user: { firstName: 'Alice', lastName: 'Smith' } as Person,
                problems: [{ name: 'Leak' } as DefectType],
                additionalInfo: 'info',
                engineHours: 100,
            };

            await apiServer.checkInBoat(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Boat checked in successfully' }));
            const logArg = saveLogEntrySpy.mock.calls[0][0]; // Check the log entry saved
            expect(logArg.boatName).toBe(req.body.boat.name);
            expect(logArg.personName).toBe(req.body.user.firstName + " " + req.body.user.lastName);
            expect(logArg.checkInDateTime).toBeDefined();
            expect(logArg.engineHours).toBe(req.body.engineHours);


            expect(checkInBoatSpy.mock.calls[0][0]).toBe(req.body.boat);
            expect(checkInBoatSpy.mock.calls[0][1]).toBe(req.body.user);
            expect(checkInBoatSpy.mock.calls[0][2]).toBe(req.body.problems);
            expect(checkInBoatSpy.mock.calls[0][3]).toBe(req.body.additionalInfo);
            expect(checkInBoatSpy.mock.calls[0][4]).toBe(req.body.engineHours);
            expect(checkInBoatSpy.mock.calls[0][5]).toBe(checkOutReason);
        });


        it('should handle errors', async () => {
            req.body = {
                boat: { name: 'Boat1', checkedOutAt: null, checkOutReason: null } as Boat,
                user: { firstName: 'Alice', lastName: 'Smith' } as Person,
                problems: [{ name: 'Leak' } as DefectType],
                additionalInfo: 'info',
                engineHours: 100,
                reason: 'Routine check'
            };
            jest.spyOn(dao, 'checkInBoat').mockRejectedValue(new Error('fail'));
            await apiServer.checkInBoat(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to check in boat' }));
        });
    });

    describe('checkOutBoat', () => {
        it('should check out a boat and save log', async () => {
            jest.spyOn(dao.boatManager, 'checkOutBoat').mockResolvedValue(true);
            jest.spyOn(dao.logManager, 'saveLogEntry');

            req.body = {
                boat: { name: 'Boat2' } as Boat,
                user: { firstName: 'Bob', lastName: 'Brown' } as Person,
                reason: 'Test reason'
            };

            await apiServer.checkOutBoat(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Boat checked out successfully' }));
        });

        it('should handle errors', async () => {
            jest.spyOn(dao.boatManager, 'checkOutBoat').mockRejectedValue(new Error('fail'));
            await apiServer.checkOutBoat(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to check out boat' }));
        });
    });

    describe('getAvailableBoats', () => {
        it('should return available boats', async () => {
            const boats = [new Boat('1', 'BoatA', true, null)];
            jest.spyOn(dao.boatManager, 'getAvailableBoats').mockResolvedValue(boats as Boat[]);

            await apiServer.getAvailableBoats(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(boats);
        });

        it('should handle errors', async () => {
            jest.spyOn(dao.boatManager, 'getAvailableBoats').mockRejectedValue(new Error('fail'));
            await apiServer.getAvailableBoats(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to fetch available boats' }));
        });
    });

    describe('getCheckedOutBoats', () => {
        it('should return checked out boats', async () => {
            const boats = [new Boat('2', 'BoatB', false, null)];
            jest.spyOn(dao.boatManager, 'getCheckedOutBoats').mockResolvedValue(boats);

            await apiServer.getCheckedOutBoats(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(boats);
        });

        it('should handle errors', async () => {
            jest.spyOn(dao.boatManager, 'getCheckedOutBoats').mockRejectedValue(new Error('fail'));
            await apiServer.getCheckedOutBoats(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to fetch checked out boats' }));
        });
    });

    describe('getPossibleDefectsList', () => {
        it('should return possible defects', async () => {
            const defects = [new DefectType(1, 'Crack', 'Its cracked')];
            jest.spyOn(dao, 'getPossibleDefectsList').mockReturnValue(defects);

            await apiServer.getPossibleDefectsList(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(defects);
        });


    });

    describe('login', () => {
        it('should return JWT token for valid password', () => {
            req.body = { email: 'test@example.com', password: 'rowlocks' };
            const jsonSpy = jest.fn();
            const statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
            res.status = statusSpy;

            apiServer.login(req as Request, res as Response);

            expect(jsonSpy).toHaveBeenCalledTimes(1);
            const token = jsonSpy.mock.calls[0][0].token;
            expect(typeof token).toBe('string');
        });

        it('should send 401 for invalid password', () => {
            req.body = { email: 'test@example.com', password: 'wrong' };
            const sendStatusSpy = jest.fn();
            res.sendStatus = sendStatusSpy;

            apiServer.login(req as Request, res as Response);

            expect(sendStatusSpy).toHaveBeenCalledWith(401);
        });
    });
});
