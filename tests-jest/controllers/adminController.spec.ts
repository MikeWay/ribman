import {describe, expect, test} from '@jest/globals';
import sinon from 'sinon';
import { AdminController } from '../../src/controllers/adminController';
import { dao } from '../../src/model/dao';
import { logManager } from '../../src/model/LogManager';
import jwt from 'jsonwebtoken';


describe('AdminController', () => {
    let req: any;
    let res: any;
    let controller: AdminController;

    beforeEach(() => {
        controller = new AdminController();
        req = {
            session: {},
            body: {},
            query: {},
            file: undefined,
            cookies: {},
        };
        res = {
            locals: {},
            render: sinon.stub(),
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
            setHeader: sinon.stub().returnsThis(),
            send: sinon.stub().returnsThis(),
            end: sinon.stub(),
            cookie: sinon.stub(),
        };
    });

    afterEach(() => {
        sinon.restore();
        jest.useFakeTimers();
    });

    it('should render adminLogin page', () => {
        controller.adminLogin(req, res);
        expect(res.render.calledWith('adminLogin', { title: 'Admin' })).toBe(true);
        expect(req.session.pageBody).toEqual('adminLogin');
    });

    it('should check in all boats', async () => {
        const stub = sinon.stub(dao.boatManager, 'checkInAllBoats').resolves();
        await controller.checkInAllBoats(req, res);
        expect(stub.calledOnce).toBe(true);
        expect(res.status.calledWith(200)).toBe(true);
        expect(res.json.calledWith({ message: 'All boats checked in.' })).toBe(true);
    });

    it('should delete all users', async () => {
        const stub = sinon.stub(dao.personManager, 'deleteAllPersons').resolves();
        await controller.deleteAllUsers(req, res);
        expect(stub.calledOnce).toBe(true);
        expect(res.status.calledWith(200)).toBe(true);
        expect(res.json.calledWith({ message: 'All users deleted successfully.' })).toBe(true);
    });

    it('should handle error when deleting all users', async () => {
        const stub = sinon.stub(dao.personManager, 'deleteAllPersons').rejects(new Error('fail'));
        await controller.deleteAllUsers(req, res);
        expect(res.status.calledWith(500)).toBe(true);
        expect(res.json.calledWithMatch({ error: 'Failed to delete all users' })).toBe(true);
    });

    it('should render adminPage on getHome', () => {
        controller.getHome(req, res);
        expect(res.render.calledWith('adminPage', { title: 'Admin' })).toBe(true);
        expect(req.session.pageBody).toEqual('adminPage');
    });

    it('should generate log reports as CSV', async () => {
        const logs = [{
            action: 'checkout',
            boatName: 'Boat1',
            personName: 'John',
            checkOutDateTime: Date.now(),
            checkInDateTime: Date.now(),
            checkOutReason: 'Fun',
            defect: '',
            additionalInfo: '',
            logKey: 'mockKey',
            toItem: function () {
                return {
                    logKey: this.logKey,
                    boatName: this.boatName,
                    personName: this.personName,
                    checkOutDateTime: this.checkOutDateTime,
                    checkInDateTime: this.checkInDateTime,
                    checkOutReason: this.checkOutReason,
                    defect: this.defect,
                    additionalInfo: this.additionalInfo,
                    action: this.action
                };
            }
        }];
        sinon.stub(logManager, 'listLogEntries').resolves(logs);
        await controller.genLogReports(req, res);
        expect(res.setHeader.calledWith('Content-Type', 'text/csv')).toBe(true);
        expect(res.status.calledWith(200)).toBe(true);
        expect(res.send.calledOnce).toBe(true);
        expect(res.end.calledOnce).toBe(true);
    });

    it('should handle error in genLogReports', async () => {
        sinon.stub(logManager, 'listLogEntries').rejects(new Error('fail'));
        await controller.genLogReports(req, res);
        expect(res.status.calledWith(500)).toBe(true);
        expect(res.json.calledWithMatch({ error: 'Internal server error' })).toBe(true);
    });

    it('should list users and render adminListUsers', async () => {
        const user = new (require('../../src/model/AdminPerson').AdminPerson)();
        user.id = '1';
        user.firstName = 'A';
        user.lastName = 'B';
        user.email_address = 'a.b@example.com';
        sinon.stub(user, 'setPassword');
        sinon.stub(user, 'validatePassword').resolves(true);
        sinon.stub(user, 'toItem').returns({});
        sinon.stub(user as any, 'setPasswordHash'); // Access private via 'as any' for stubbing

        sinon.stub(dao.adminPersonManager, 'getAllPersons').resolves([user]);
        await controller.listUsers(req, res);
        expect(res.render.calledWith('adminListUsers', sinon.match.has('users', [user]))).toBe(true);
        expect(req.session.pageBody).toEqual('adminListUsers');
    });

    it('should handle error in listUsers', async () => {
        sinon.stub(dao.adminPersonManager, 'getAllPersons').rejects(new Error('fail'));
        await controller.listUsers(req, res);
        expect(res.render.calledWith('adminListUsers', sinon.match.has('error', 'Failed to fetch users'))).toBe(true);
    });

    it('should login admin and set jwt cookie', async () => {
        req.body = { email: 'admin@test.com', password: 'pass' };
        const admin = {
            id: '1',
            email_address: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            setPassword: sinon.stub(),
            validatePassword: sinon.stub().resolves(true),
            toItem: sinon.stub(),
            setPasswordHash: sinon.stub(), // Add missing property to match AdminPerson type
        };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').resolves(admin as any);
        sinon.stub(jwt, 'sign').callsFake(() => 'token');
        const getHomeStub = sinon.stub(controller, 'getHome');
        await controller.login(req, res);
        expect(res.cookie.calledWith('jwt', 'token', sinon.match.object)).toBe(true);
        expect(getHomeStub.calledOnce).toBe(true);
    });

    it('should render error on invalid login', async () => {
        req.body = { email: 'admin@test.com', password: 'wrong' };
        const admin = {
            id: '1',
            email_address: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            setPassword: sinon.stub(),
            validatePassword: sinon.stub().resolves(false),
            toItem: sinon.stub(),
            setPasswordHash: sinon.stub(),
        };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').resolves(admin as any);
        await controller.login(req, res);
        expect(res.render.calledWith('error', { error: 'Invalid email or password' })).toBe(true);
    });

    it('should render error on login exception', async () => {
        req.body = { email: 'admin@test.com', password: 'wrong' };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').rejects(new Error('fail'));
        await controller.login(req, res);
        expect(res.render.calledWith('error', { error: 'Invalid email or password' })).toBe(true);
    });

    it('should render adminLoadUsers page', () => {
        controller.loadNewUsers(req, res);
        expect(res.render.calledWith('index', { title: 'Load Users' })).toBe(true);
        expect(req.session.pageBody).toEqual('adminLoadUsers');
    });

    it('should render adminSetPassword page', async () => {
        req.query = { email_address: 'admin@test.com' };
        const admin = { id: '1', email: 'admin@test.com' };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').resolves(admin as any);
        await controller.inputAdminPassword(req, res);
        expect(res.render.calledWith('adminSetPassword', sinon.match.has('email_address', 'admin@test.com'))).toBe(true);
    });

    it('should set admin password', async () => {
        req.body = { email: 'admin@test.com', password: 'newpass' };
        const admin = { setPassword: sinon.stub().resolves(), id: '1' };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').resolves(admin as any);
        sinon.stub(dao.adminPersonManager, 'saveAdminPerson').resolves();
        await controller.setAdminPassword(req, res);
        expect(admin.setPassword.calledWith('newpass')).toBe(true);
        expect(res.status.calledWith(200)).toBe(true);
        expect(res.json.calledWith({ message: 'Password updated successfully' })).toBe(true);
    });

    it('should return 404 if admin not found in setAdminPassword', async () => {
        req.body = { email: 'notfound@test.com', password: 'pass' };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').resolves(null);
        await controller.setAdminPassword(req, res);
        expect(res.status.calledWith(404)).toBe(true);
        expect(res.json.calledWithMatch({ error: 'Admin not found' })).toBe(true);
    });

    it('should handle error in setAdminPassword', async () => {
        req.body = { email: 'admin@test.com', password: 'pass' };
        sinon.stub(dao.adminPersonManager, 'getAdminByEmail').rejects(new Error('fail'));
        await controller.setAdminPassword(req, res);
        expect(res.status.calledWith(500)).toBe(true);
        expect(res.json.calledWithMatch({ error: 'Internal server error' })).toBe(true);
    });

    it('should handle uploadUsers with no file', async () => {
        await controller.uploadUsers(req, res);
        expect(res.render.calledWith('index', { title: 'Error', message: 'No file uploaded' })).toBe(true);
    });

    it('should upload users from CSV', async () => {
        const csv = 'id,firstName,lastName,dob\n1,John,Doe,1990-01-01\n';
        req.file = { buffer: Buffer.from(csv) };
        const saveStub = sinon.stub(dao.personManager, 'savePerson').resolves();
        await controller.uploadUsers(req, res);
        expect(saveStub.calledOnce).toBe(true);
        expect(res.status.calledWith(200)).toBe(true);
        expect(res.json.calledWith({ message: 'Users uploaded successfully' })).toBe(true);
    });

    it('should handle error in uploadUsers', async () => {
        req.file = { buffer: Buffer.from('id,firstName,lastName,dob\nid,firstName,lastName,dob\n') };
        sinon.stub(dao.personManager, 'savePerson').rejects(new Error('fail'));
        await controller.uploadUsers(req, res);
        expect(res.status.calledWith(500)).toBe(true);
        expect(res.json.calledWithMatch({ error: 'Failed to upload users' })).toBe(true);
    });
});