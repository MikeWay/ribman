import { Request, Response } from 'express';
import { dao } from '../model/dao';

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
                }
            case 'checkInComplete':
                {
                    console.log('Processing form data for checkInComplete');
                    const boatId = req.session.theBoatId;
                    if (boatId) {
                        const boat = await dao.boatManager.getBoatById(boatId);
                        if (boat) {
                            // Assuming the boat is checked in, save it to the database
                            boat.isAvailable = true; // Mark the boat as available
                            dao.boatManager.saveBoat(boat);
                        }
                    }
                    break;
                }
            case 'checkedOut':
                console.log('Processing form data for checkedOut');

            // Here you might want to finalize the check-in process, e.g., save engine hours or defects
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
        }
    }
}
