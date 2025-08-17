import { AdminPersonManager } from '../../src/model/AdminPersonManager';
import { AdminPerson } from '../../src/model/AdminPerson';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, GetCommand, PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import sinon from 'sinon';


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
  };
});

describe('AdminPersonManager', () => {
    let manager: AdminPersonManager;
    let ddbDocClientStub: any;
    let sendStub: sinon.SinonStub;
    

    beforeEach(() => {
        manager = new AdminPersonManager();
        ddbDocClientStub = { send: sinon.stub() };
        manager['ddbDocClient'] = ddbDocClientStub;
        sinon.stub(DynamoDBDocumentClient, 'from').returns(ddbDocClientStub);
        sinon.stub(unmarshall as any, 'call').callsFake((item: any) => item);
        sendStub = ddbDocClientStub.send;
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getAdminByEmail', () => {
        it('should return AdminPerson when found', async () => {
            const item = { email_address: 'test@example.com', firstName: 'John', lastName: 'Doe' };
            sendStub.resolves({ Item: item });
            sinon.stub(AdminPerson, 'fromItem').returns(item as AdminPerson);

            const result = await manager.getAdminByEmail('test@example.com');
            expect(sendStub.calledWith(sinon.match.instanceOf(GetCommand))).toBe(true);
            expect(result).toEqual(item);
        });

        it('should call AdminPerson.fromItem with correct item', async () => {
            const item = { email_address: 'test@example.com', firstName: 'John', lastName: 'Doe' };
            sendStub.resolves({ Item: item });
            const fromItemSpy = sinon.stub(AdminPerson, 'fromItem').returns(item as AdminPerson);

            await manager.getAdminByEmail('test@example.com');
            expect(fromItemSpy.calledWith(item)).toBe(true);

            fromItemSpy.restore();
        });
        it('should return null when not found', async () => {
            sendStub.resolves({ Item: undefined });
            const result = await manager.getAdminByEmail('notfound@example.com');
            expect(result).toBeNull();
        });

        it('should throw and log error on failure', async () => {
            sendStub.rejects(new Error('DynamoDB error'));
            const errorSpy = sinon.stub(console, 'error');
            await expect(manager.getAdminByEmail('fail@example.com')).rejects.toThrow('DynamoDB error');
            expect(errorSpy.called).toBe(true);
            errorSpy.restore();
        });
    });

    describe('saveAdminPerson', () => {
        it('should save a valid AdminPerson', async () => {
            const person = {
                toItem: sinon.stub().returns({}),
                firstName: 'Jane',
                lastName: 'Smith',
                email_address: 'jane@example.com'
            } as unknown as AdminPerson;
            sendStub.resolves({});
            await manager.saveAdminPerson(person);
            expect(sendStub.calledWith(sinon.match.instanceOf(PutCommand))).toBe(true);
        });

        it('should throw error for invalid person', async () => {
            await expect(manager.saveAdminPerson({} as AdminPerson)).rejects.toThrow('Invalid person object');
        });

        it('should throw and log error on failure', async () => {
            const person = {
                toItem: sinon.stub().returns({}),
                firstName: 'Jane',
                lastName: 'Smith',
                email_address: 'jane@example.com'
            } as unknown as AdminPerson;
            sendStub.rejects(new Error('Put error'));
            const errorSpy = sinon.stub(console, 'error');
            await expect(manager.saveAdminPerson(person)).rejects.toThrow('Put error');
            expect(errorSpy.called).toBe(true);
            errorSpy.restore();
        });
    });

    describe('getAllPersons', () => {
        it('should return array of AdminPerson', async () => {
            const items = [{ email_address: { S: 'a@b.com' } }, { email_address: { S: 'c@d.com' } }];
            sendStub.resolves({ Items: items });
            sinon.stub(AdminPerson, 'fromItem').callsFake((item: any) => item as AdminPerson);

            const result = await manager.getAllPersons();
            expect(sendStub.calledWith(sinon.match.instanceOf(ScanCommand))).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty('email_address', 'a@b.com');
        });

        it('should return empty array if Items is missing', async () => {
            sendStub.resolves({});
            const result = await manager.getAllPersons();
            expect(result).toEqual([]);
        });

        it('should throw and log error on failure', async () => {
            sendStub.rejects(new Error('Scan error'));
            const errorSpy = sinon.stub(console, 'error');
            await expect(manager.getAllPersons()).rejects.toThrow('Scan error');
            expect(errorSpy.called).toBe(true);
            errorSpy.restore();
        });
    });

    describe('deletePerson', () => {
        it('should delete person by email', async () => {
            sendStub.resolves({});
            await manager.deletePerson('delete@example.com');
            expect(sendStub.calledWith(sinon.match.instanceOf(DeleteCommand))).toBe(true);
        });

        it('should throw and log error on failure', async () => {
            sendStub.rejects(new Error('Delete error'));
            const errorSpy = sinon.stub(console, 'error');
            await expect(manager.deletePerson('fail@example.com')).rejects.toThrow('Delete error');
            expect(errorSpy.called).toBe(true);
            errorSpy.restore();
        });
    });
});
