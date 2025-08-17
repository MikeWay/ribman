import { AdminPerson } from '../../src/model/AdminPerson';
import * as crypto from 'crypto';

jest.mock('crypto');

describe('AdminPerson', () => {
    const email = 'admin@example.com';
    const firstName = 'Alice';
    const lastName = 'Smith';

    beforeEach(() => {
        //jest.clearAllMocks();
    });

    it('should construct with correct properties', () => {
        const admin = new AdminPerson(email, firstName, lastName);
        expect(admin.email_address).toBe(email);
        expect(admin.firstName).toBe(firstName);
        expect(admin.lastName).toBe(lastName);
        expect(admin.passwordHash).toBeUndefined();
    });

    describe('setPassword', () => {
        it('should set passwordHash', async () => {
            const admin = new AdminPerson(email, firstName, lastName);
            // Mock randomBytes and scrypt
            (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('salt123456789012'));
            (crypto.scrypt as jest.Mock).mockImplementation((password, salt, keylen, cb) => {
                cb(null, Buffer.from('hashedpassword'));
            });

            await admin.setPassword('mypassword');
            expect(admin.passwordHash).toContain(Buffer.from('salt123456789012').toString('hex'));
            expect(admin.passwordHash).toContain(Buffer.from('hashedpassword').toString('hex'));
        });
    });

    describe('validatePassword', () => {
        it('should return false if passwordHash is not set', async () => {
            const admin = new AdminPerson(email, firstName, lastName);
            expect(await admin.validatePassword('any')).toBe(false);
        });


        it('should validate correct password', async () => {
            const admin = new AdminPerson(email, firstName, lastName);
            admin.passwordHash = 'salt:' + Buffer.from('correcthash').toString('hex');
            (crypto.scrypt as jest.Mock).mockImplementation((password, salt, keylen, cb) => {
                cb(null, Buffer.from('correcthash'));
            });
            await expect(admin.validatePassword('mypassword')).resolves.toBe(true);
        });
        
        it('should fail validation for incorrect password', async () => {
            const admin = new AdminPerson(email, firstName, lastName);
            admin.passwordHash = 'salt:correcthash';
            (crypto.scrypt as jest.Mock).mockImplementation((password, salt, keylen, cb) => {
                cb(null, Buffer.from('wronghash', 'hex'));
            });
            await expect(admin.validatePassword('mypassword')).resolves.toBe(false);
        });
    });

    describe('toItem', () => {
        it('should return correct item', () => {
            const admin = new AdminPerson(email, firstName, lastName);
            admin.passwordHash = 'hash';
            expect(admin.toItem()).toEqual({
                email_address: email,
                firstName,
                lastName,
                passwordHash: 'hash'
            });
        });
    });

    describe('fromItem', () => {
        it('should create AdminPerson from item', () => {
            const item = {
                email_address: email,
                firstName,
                lastName,
                passwordHash: 'hash'
            };
            const admin = AdminPerson.fromItem(item);
            expect(admin).toBeInstanceOf(AdminPerson);
            expect(admin.email_address).toBe(email);
            expect(admin.firstName).toBe(firstName);
            expect(admin.lastName).toBe(lastName);
            expect(admin.passwordHash).toBe('hash');
        });
    });
});