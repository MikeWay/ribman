import { Request, Response } from 'express';
import { dao } from '../model/dao';

export class PagePreparationController {
    public async prepareNextPage(req: Request, res: Response, currentPage: string, targetPage: string): Promise<void> {
        switch (targetPage) {
            case 'page1':
                this.prepareCheckinOrCheckoutPage(req, res);
                break;
            case 'selectBoatToCheckout':
                await this.prepareSelectBoatToCheckoutPage(req, res);
                break;
            case 'whoAreYou':
                this.prepareWhoAreYouPage(req, res);
                break;
            case 'startCheckIn':
                this.prepareCheckinPage(req, res);
                break;
            case 'checkInComplete':
                console.log('Preparing data for checkInComplete');
                break;
            case 'recordEngineHours':
                console.log('Preparing data for recordEngineHours');
                break;
            case 'checkedOut':
                console.log('Preparing data for checkedOut');
                this.prepareCheckedOutPage(req, res);
        }
    }

    private prepareCheckinOrCheckoutPage(req: Request, res: Response): void {
        console.log('Preparing data for page1');
    }

    private async prepareSelectBoatToCheckoutPage(req: Request, res: Response): Promise<void> {
        const boats = await dao.boatManager.getAvailableBoats();
        res.locals.boats = boats;
        if (boats.length === 0) {
            res.locals.message = 'Sorry: all boats are currently checked out!';
        }
    }

    private prepareWhoAreYouPage(req: Request, res: Response): void {
        res.locals.people = dao.personManager.getPersons();
    }

    private async prepareCheckinPage(req: Request, res: Response): Promise<void> {
        res.locals.boats = await dao.boatManager.getCheckedOutBoats();
    }

    prepareCheckedOutPage(req: Request, res: Response) {
        // Get the boat from the session and pass it to the view
        const boat = req.session.theBoat;
        if (boat) {
            res.locals.boatName = boat.name;
            console.log(`Boat checked out: ${boat.name}`);
        } else {
            res.locals.message = 'No boat selected for checkout.';
            console.log('No boat selected for checkout.');
        }
    }
}