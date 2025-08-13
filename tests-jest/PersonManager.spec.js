"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PersonManager_1 = require("../src/model/PersonManager");
const Person_1 = require("../src/model/Person");
jest.mock('@aws-sdk/lib-dynamodb', () => {
    const actual = jest.requireActual('@aws-sdk/lib-dynamodb');
    return Object.assign(Object.assign({}, actual), { DynamoDBDocumentClient: {
            from: jest.fn().mockReturnValue({
                send: jest.fn(),
            }),
        }, PutCommand: jest.fn() });
});
describe('PersonManager', () => {
    let personManager;
    let mockSend;
    beforeEach(() => {
        personManager = new PersonManager_1.PersonManager();
        // @ts-ignore
        mockSend = personManager['ddbDocClient'].send;
        mockSend.mockClear();
    });
    it('should save a person to DynamoDB', () => __awaiter(void 0, void 0, void 0, function* () {
        const person = {
            id: '1',
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@example.com',
            toItem: jest.fn().mockReturnValue({ id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }),
        };
        mockSend.mockResolvedValueOnce({});
        yield expect(personManager.savePerson(person)).resolves.not.toThrow();
        expect(person.toItem).toHaveBeenCalled();
        expect(mockSend).toHaveBeenCalled();
    }));
    it('should throw error if person is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        yield expect(personManager.savePerson(null)).rejects.toThrow('Invalid person object');
    }));
    it('should throw error if DynamoDB send fails', () => __awaiter(void 0, void 0, void 0, function* () {
        const person = {
            id: '2',
            firstName: 'Bob',
            lastName: 'Jones',
            email: 'bob@example.com',
            toItem: jest.fn().mockReturnValue({ id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }),
        };
        mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));
        yield expect(personManager.savePerson(person)).rejects.toThrow('DynamoDB error');
    }));
    it('should return an array of Person objects when items are returned from DynamoDB', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockItems = [
            { id: { S: '1' }, firstName: { S: 'Alice' }, lastName: { S: 'Smith' }, email: { S: 'alice@example.com' } },
            { id: { S: '2' }, firstName: { S: 'Bob' }, lastName: { S: 'Jones' }, email: { S: 'bob@example.com' } },
        ];
        mockSend.mockResolvedValueOnce({ Items: mockItems });
        const fromItemSpy = jest.spyOn(Person_1.Person, 'fromItem').mockImplementation((item) => item);
        const result = yield personManager.loadAllPersons();
        expect(mockSend).toHaveBeenCalled();
        expect(fromItemSpy).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
            { id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
        ]);
        fromItemSpy.mockRestore();
    }));
    it('should return an empty array if no items are returned from DynamoDB', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockResolvedValueOnce({ Items: undefined });
        const result = yield personManager.loadAllPersons();
        expect(mockSend).toHaveBeenCalled();
        expect(result).toEqual([]);
    }));
    it('should throw an error if DynamoDB send fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));
        yield expect(personManager.loadAllPersons()).rejects.toThrow('DynamoDB error');
    }));
    const firstLetter = 'S';
    const birthDay = 15;
    const birthMonth = 6;
    it('should return a Person when a matching item is found', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockItem = {
            id: { S: '3' },
            firstName: { S: 'Sally' },
            lastName: { S: 'Smith' },
            birthDay: { N: '15' },
            birthMonth: { N: 6 },
            searchKey: { S: "s-15-6" }
        };
        mockSend.mockResolvedValueOnce({ Items: [mockItem] });
        const fromItemSpy = jest.spyOn(Person_1.Person, 'fromItem').mockImplementation((item) => ({
            id: '3',
            firstName: 'Sally',
            lastName: 'Smith',
            birthDay: 15,
            birthMonth: 6,
            searchKey: "s-15-6"
        }));
        const result = yield personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth, 0);
        expect(mockSend).toHaveBeenCalled();
        expect(fromItemSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: '3',
            firstName: 'Sally',
            lastName: 'Smith',
            birthDay: 15,
            birthMonth: 6,
            searchKey: "s-15-6"
        }));
        expect(result).toEqual([new Person_1.Person('3', 'Sally', 'Smith', 6, 15)]);
        fromItemSpy.mockRestore();
    }));
    it('should return null when no matching items are found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockResolvedValueOnce({ Items: [] });
        const result = yield personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth, 0);
        expect(mockSend).toHaveBeenCalled();
        expect(result).toEqual([]);
    }));
    it('should throw an error if DynamoDB send fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));
        yield expect(personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth, 0)).rejects.toThrow('DynamoDB error');
    }));
});
describe('PersonManager.deleteAllPersons', () => {
    let personManager;
    let mockSend;
    beforeEach(() => {
        personManager = new PersonManager_1.PersonManager();
        // @ts-ignore
        mockSend = personManager['ddbDocClient'].send;
        mockSend.mockClear();
    });
    it('should delete all persons from the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockItems = [
            { id: { S: '1' }, firstName: { S: 'Alice' }, lastName: { S: 'Smith' } },
            { id: { S: '2' }, firstName: { S: 'Bob' }, lastName: { S: 'Jones' } },
        ];
        mockSend.mockResolvedValueOnce({ Items: mockItems });
        yield personManager.deleteAllPersons();
        expect(mockSend).toHaveBeenCalledTimes(3); // ScanCommand and a DeleteCommand for each item
    }));
    it('should do nothing if no items are returned from DynamoDB', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockResolvedValueOnce({ Items: [] });
        yield expect(personManager.deleteAllPersons()).resolves.not.toThrow();
        expect(mockSend).toHaveBeenCalledTimes(1); // Only ScanCommand
    }));
    it('should throw an error if ScanCommand fails', () => __awaiter(void 0, void 0, void 0, function* () {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));
        yield expect(personManager.deleteAllPersons()).rejects.toThrow('DynamoDB error');
        expect(mockSend).toHaveBeenCalledTimes(1);
    }));
});
