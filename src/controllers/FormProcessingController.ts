import { Request, Response } from 'express';
import { dao } from '../model/dao';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { LogEntry } from '../model/log';
import session from 'express-session';

export class FormProcessingController {
    public async processIncomingForm(req: Request, res: Response, currentPage: string): Promise<void> {
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
                    this.processWhoAreYou(req, res);
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

            // Here you might want to finalize the check-in process, e.g., save engine hours or defects
        }
    }
    processReasonForCheckout(req: Request, res: Response) {
        const reason = req.body.reason;
        if (reason) {
            if(req.session.logEntry)
                req.session.logEntry.checkOutReason = reason;
            console.log(`Checkout reason set: ${reason}`);
        }
    }

    private processWhoAreYou(req: Request, res: Response) {
        const personId = req.body.person;
        if (personId) {
            const person = dao.personManager.getPersonById(personId);
            if (person) {
                req.session.person = person;
                console.log(`Person selected: ${person.name}`);
                if(req.session.logEntry)
                    req.session.logEntry.personName = person.name;
            } else {
                console.log(`Person not found`);
            }
        }
    }

    private processCheckinOrCheckout(req: Request, res: Response): void {
        req.session.checkIn = req.body.check_in === 'true';
    }
    private async processBoatSelection(req: Request, res: Response): Promise<void> {
        const boatId = req.body.boat;
        if (boatId) {
            await dao.boatManager.checkOutBoat(boatId);
            req.session.theBoatId = boatId;
            const boat = await dao.boatManager.getBoatById(boatId);
            if (!boat || typeof boat.toItem !== 'function') {
                console.error('Invalid boat object provided to saveBoat:', boat);
                throw new Error('Invalid boat object');
            }
            // Start building the log entry
            req.session.logEntry = new LogEntry({boatName: boat.name, checkOutDateTime: new Date()});
        }
    }
}
