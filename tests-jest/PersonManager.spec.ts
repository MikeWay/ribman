import { PersonManager } from '../src/model/PersonManager';
import { Person } from '../src/model/Person';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

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

describe('PersonManager', () => {
  let personManager: PersonManager;
  let mockSend: jest.Mock;

  beforeEach(() => {
    personManager = new PersonManager();
    // @ts-ignore
    mockSend = personManager['ddbDocClient'].send as jest.Mock;
    mockSend.mockClear();
  });

  it('should save a person to DynamoDB', async () => {
    const person: Person = {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      toItem: jest.fn().mockReturnValue({ id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }),
    } as any;

    mockSend.mockResolvedValueOnce({});

    await expect(personManager.savePerson(person)).resolves.not.toThrow();
    expect(person.toItem).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw error if person is invalid', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await expect(personManager.savePerson(null)).rejects.toThrow('Invalid person object');
  });

  it('should throw error if DynamoDB send fails', async () => {
    const person: Person = {
      id: '2',
      firstName: 'Bob',
      lastName: 'Jones',
      email: 'bob@example.com',
      toItem: jest.fn().mockReturnValue({ id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' }),
    } as any;

    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(personManager.savePerson(person)).rejects.toThrow('DynamoDB error');
  });


  it('should return an array of Person objects when items are returned from DynamoDB', async () => {
    const mockItems = [
      { id: { S: '1' }, firstName: { S: 'Alice' }, lastName: { S: 'Smith' }, email: { S: 'alice@example.com' } },
      { id: { S: '2' }, firstName: { S: 'Bob' }, lastName: { S: 'Jones' }, email: { S: 'bob@example.com' } },
    ];
    mockSend.mockResolvedValueOnce({ Items: mockItems });

    const fromItemSpy = jest.spyOn(Person, 'fromItem').mockImplementation((item: any) => item as Person);

    const result = await personManager.loadAllPersons();

    expect(mockSend).toHaveBeenCalled();
    expect(fromItemSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
      { id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com' },
    ]);

    fromItemSpy.mockRestore();
  });

  it('should return an empty array if no items are returned from DynamoDB', async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined });

    const result = await personManager.loadAllPersons();

    expect(mockSend).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should throw an error if DynamoDB send fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(personManager.loadAllPersons()).rejects.toThrow('DynamoDB error');
  });

    const firstLetter = 'S';
    const birthDay = 15;
    const birthMonth = 'June';

    it('should return a Person when a matching item is found', async () => {
        const mockItem = {
            id: { S: '3' },
            firstName: { S: 'Sally' },
            lastName: { S: 'Smith' },
            email: { S: 'sally@example.com' },
            birthDay: { N: '15' },
            birthMonth: { S: 'June' }
        };
        mockSend.mockResolvedValueOnce({ Items: [mockItem] });

        const fromItemSpy = jest.spyOn(Person, 'fromItem').mockImplementation((item: any) => ({
            id: '3',
            firstName: 'Sally',
            lastName: 'Smith',
            birthDay: 15,
            birthMonth: 'June'
         }) as Person);

        const result = await personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth);

        expect(mockSend).toHaveBeenCalled();
        expect(fromItemSpy).toHaveBeenCalledWith(expect.objectContaining({
            id: '3',
            firstName: 'Sally',
            lastName: 'Smith',
            email: 'sally@example.com',
            birthDay: 15,
            birthMonth: 'June'
        }));
        expect(result).toEqual(new Person('3','Sally','Smith','June',15))

        fromItemSpy.mockRestore();
    });

    it('should return null when no matching items are found', async () => {
        mockSend.mockResolvedValueOnce({ Items: [] });

        const result = await personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth);

        expect(mockSend).toHaveBeenCalled();
        expect(result).toBeNull();
    });

    it('should throw an error if DynamoDB send fails', async () => {
        mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

        await expect(
            personManager.getPersonByLastNameAndBirthDate(firstLetter, birthDay, birthMonth)
        ).rejects.toThrow('DynamoDB error');
    });
});