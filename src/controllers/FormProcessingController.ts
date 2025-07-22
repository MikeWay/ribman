import { Request, Response } from 'express';
import { dao } from '../model/dao';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { LogEntry } from '../model/log';
import session from 'express-session';

export class FormProcessingController {
    public async processIncomingForm(req: Request, res: Response, currentPage: string): Promise<boolean> {
        let result = true;
        switch (currentPage) {
            case 'page1':
                this.processCheckinOrCheckout(req, res);
                break;
            case 'selectBoatToCheckout':
                await this.processBoatSelection(req, res);
                break;
            case 'reportFault':
                console.log('Processing form data for reportFault');
                break;
            case 'recordEngineHours':
                console.log('Processing form data for recordEngineHours');
                break;
            case 'whoAreYou':
                {
                    console.log('Processing form data for whoAreYou');
                    result = await this.processWhoAreYou(req, res);
                    break;
                }
            case 'checkInComplete':
                {
                    console.log('Processing form data for checkInComplete');

                    break;
                }
            case 'checkedOut':
                console.log('Processing form data for checkedOut');
                break
            case 'reasonForCheckout':
                console.log('Processing form data for reasonForCheckout');
                this.processReasonForCheckout(req, res);
                break;
            case 'startCheckIn':
                console.log('Processing form data for startCheckIn');
                // You might want to add logic here to prepare for the check-in process
                this.processStartCheckIn(req, res);

                break;
            default:
                console.log(`Unknown page: ${currentPage}, defaulting to page1`);
                res.locals.pageBody = 'page1';
                req.session.pageBody = res.locals.pageBody;
                break;

            // Here you might want to finalize the check-in process, e.g., save engine hours or defects
        }
        return result;
    }
    processStartCheckIn(req: Request, res: Response) {
        throw new Error('Method not implemented.');
    }

    private async processReasonForCheckout(req: Request, res: Response) {
        const reason = req.body.reason;
        if (reason) {
            if (req.session.logEntry) {
                req.session.logEntry.checkOutReason = reason;
                await dao.boatManager.checkOutBoat(req.session.theBoatId as string);
            }

            console.log(`Checkout reason set: ${reason}`);
        }
    }

    private async processWhoAreYou(req: Request, res: Response): Promise<boolean> {
        return false;
        // const day = req.body.day;
        // const month: number = req.body.month;
        // const familyInitial = req.body.familyInitial;
        // let result = true;

        // // convert month string to number


        // const person = await dao.personManager.getPersonByLastNameAndBirthDate(familyInitial, day, month);
        // if (person) {
        //     req.session.person = person;
        //     console.log(`Person selected: ${person.firstName} ${person.lastName}`);
        //     if (req.session.logEntry)
        //         req.session.logEntry.personName = person.firstName + ' ' + person.lastName;
        // } else {
        //     console.log(`Person not found`);
        //     result = false;
        //     // TODO: Handle the case where the person is not found -- need to redirect to a the previous page       
        // }
        // return result;
    }

    private processCheckinOrCheckout(req: Request, res: Response): void {
        req.session.checkIn = req.body.check_in === 'true';
    }
    private async processBoatSelection(req: Request, res: Response): Promise<void> {
        const boatId = req.body.boat;
        if (boatId) {
            req.session.theBoatId = boatId;
            const boat = await dao.boatManager.getBoatById(boatId);
            if (!boat || typeof boat.toItem !== 'function') {
                console.error('Invalid boat object provided to saveBoat:', boat);
                throw new Error('Invalid boat object');
            }
            // Start building the log entry
            req.session.logEntry = new LogEntry({ boatName: boat.name, checkOutDateTime: new Date().getTime() });
        }
    }
}
