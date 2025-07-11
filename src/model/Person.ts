// Class representing a person in the system
export class Person {
    id: string; // Unique identifier for the person
    firstName: string; // Full name of the person
    lastName: string; //  last name of the person
    birthMonth: string; // Birth month of the person
    birthDay: number; // Birth day of the person

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        birthMonth: string,
        birthDay: number
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthMonth = birthMonth;
        this.birthDay = birthDay;
    }

    // toItem method to convert the person object to a format suitable for DynamoDB
    toItem(): {
        id: string,
        firstName: string,
        lastName: string,
        birthMonth: string,
        birthDay: number
    } {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            birthMonth: this.birthMonth,
            birthDay: this.birthDay
        };
    }
}