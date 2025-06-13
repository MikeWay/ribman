// Person Manager loads a list of persons and provides methods to access them

// class PersonManager {

export class Person {
    id: string;
    name: string;
    email: string;

    constructor(id: string, name: string, email: string) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}

export class PersonManager {
    private persons: Person[] = [
        new Person('1', 'Alice Smith', 'x@y.com'),
        new Person('2', 'Bob Johnson', 'b@y.com'),
        new Person('3', 'Charlie Brown', 'c@y.com')
    ]; 

    addPerson(person: Person): void {
        this.persons.push(person);
    }

    getPersons(): Person[] {
        return this.persons;
    }

    getPersonById(id: string): Person | undefined {
        return this.persons.find(person => person.id === id);
    }

    getPersonByName(name: string): Person | undefined {
        return this.persons.find(person => person.name.toLowerCase() === name.toLowerCase());
    }
}
export const personManager = new PersonManager();


