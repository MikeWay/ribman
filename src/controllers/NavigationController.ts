import { Request, Response } from 'express';
import { PagePreparationController } from './PagePreparationController';
import { FormProcessingController } from './FormProcessingController';
import { SessionData } from 'express-session';
import { Boat } from '../model/Boat';
import { Person } from '../model/Person';

declare module 'express-session' {
    export interface SessionData {
        pageBody?: string;
        checkIn?: boolean;
        theBoat?: Boat;
        person?: Person; // Assuming you want to store the selected person
    }
}
// Extend the SessionData interface to include pageBody
export class NavigationController {
    private pagePreparationController: PagePreparationController;
    private formProcessingController: FormProcessingController;

    constructor() {
        console.log('NavigationController initialized');
        // Initialize any necessary components or services here
        this.pagePreparationController = new PagePreparationController();
        this.formProcessingController = new FormProcessingController();
    }
    // a bi-directional list of page transitions

    private pageTransitionsCheckOut: { [key: string]: string } = {
        'page1': 'selectBoatToCheckout',
        'selectBoatToCheckout': 'whoAreYou',
        'whoAreYou': 'reasonForCheckout',
        'reasonForCheckout': 'checkedOut'
    };

    private pageTransitionsCheckIn: { [key: string]: string } = {
        'page1': 'startCheckIn',
        'startCheckIn': 'recordEngineHours',
        'recordEngineHours': 'areThereDefects',
        'areThereDefects': 'reportFault',
        'reportFault': 'checkInComplete',
        'checkInComplete': 'page1'
    };

    public async navigate(req: Request, res: Response): Promise<void> {
        let result = true;
        let targetPage = req.session.pageBody as string || 'page1';
        const currentPage = req.session.pageBody || 'page1';
        const action = req.method === 'POST' ? req.body.action : req.query.action || 'next';

        if (action === 'next') {
            result = await this.formProcessingController.processIncomingForm(req, res, currentPage);
        }

        if(result){
        const transitions = req.session.checkIn ? this.pageTransitionsCheckIn : this.pageTransitionsCheckOut;
          targetPage = action === 'previous'
            ? Object.keys(transitions).find(key => transitions[key] === currentPage) || 'page1'
            : transitions[currentPage] || 'page1';

        if (currentPage === 'areThereDefects' && req.body.defects === 'no' && action === 'next') {
            targetPage = 'checkInComplete';
        }
        }

        await this.pagePreparationController.prepareNextPage(req, res, currentPage, targetPage);
        req.session.pageBody = res.locals.pageBody = targetPage;

        res.render('index', { title: `${action === 'previous' ? 'Previous' : 'Next'} Page: ${targetPage}` });
    }
}