import { Request, Response } from 'express';
import { dao } from '../model/dao';

export class FormProcessingController {
    public processIncomingForm(req: Request, res: Response, currentPage: string): void {
        switch (currentPage) {
            case 'page1':
                this.processCheckinOrCheckout(req, res);
                break;
            case 'selectBoatToCheckout':
                this.processBoatSelection(req, res);
                break;
            case 'reportFault':
                console.log('Processing form data for reportFault');
                break;
            case 'recordEngineHours':
                console.log('Processing form data for recordEngineHours');
                break;
            case 'whoAreYou':
                console.log('Processing form data for whoAreYou');
                const personName = req.body.person;
                if (personName) {
                    const person = dao.personManager.getPersonByName(personName);
                    if (person) {
                        req.session.person = person;
                        console.log(`Person selected: ${person.name}`);
                    } else {
                        console.log(`Person not found`);
                    }
                }
                break;
            case 'checkInComplete':
                console.log('Processing form data for checkInComplete');
                // Here you might want to finalize the check-in process, e.g., save engine hours or defects
        }
    }

    private processCheckinOrCheckout(req: Request, res: Response): void {
        req.session.checkIn = req.body.check_in === 'true';
    }

    private processBoatSelection(req: Request, res: Response): void {
        const boatId = req.body.boat;
        if (boatId) {
            dao.boatManager.checkOutBoat(boatId);
            req.session.theBoat = dao.boatManager.getBoatById(boatId);
        }
    }
}