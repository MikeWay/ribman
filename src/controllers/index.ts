import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import session from 'express-session';
import { ParsedQs } from 'qs';
import { dao } from '../model/dao';
import { Boat } from '../model/boats';

// Extend the SessionData interface to include pageBody
declare module 'express-session' {
    interface SessionData {
        pageBody?: string;
        checkIn?: boolean;
        theBoat?: Boat
    }
}


export class IndexController {
    // a bi-directional list of page transitions
    // This is a simple state machine to manage page transitions
    // The keys are the current page, and the values are the next page
    // This allows for easy navigation between pages        
    private pageTransitionsCheckOut: { [key: string]: string } = {
        'page1': 'selectBoatToCheckout',
        'selectBoatToCheckout': 'whoAreYou',
        'whoAreYou': 'checkedOut' // Loop back to page1
    };

    private pageTransitionsCheckIn: { [key: string]: string } = {
        'page1': 'startCheckIn',
        'startCheckIn': 'recordEngineHours',
        'recordEngineHours': 'areThereDefects',  // Record Engine Hours page
        'areThereDefects': 'checkInComplete', // Are There Defects page
        'checkInComplete': 'page1', // Check-In Complete page
    };

    public getHome(req: Request, res: Response): void {
        res.locals.pageBody = 'page1';
        req.session.pageBody = res.locals.pageBody;
        // render the page1 view with the usernames 
        res.render('index', { title: 'Page 1' });
    }

    public getAbout(req: Request, res: Response): void {
        res.send('This is the About Page');
    }

    public navigate(req: Request, res: Response): void {
        const currentPage = req.session.pageBody || 'page1';

        const action = req.method === 'POST' ? req.body.action as string : req.query.action as string || 'next';
        if (action === 'next') {
            this.processIncommingForm(req, res, currentPage);
        }

        let targetPage: string;
        const transitions = req.session.checkIn === true ? this.pageTransitionsCheckIn : this.pageTransitionsCheckOut;


        if (action === 'previous') {
            targetPage = Object.keys(transitions).find(
                key => transitions[key] === currentPage
            ) || 'page1';
        } else {
            targetPage = transitions[currentPage] || 'page1';

        }
        this.prepNextPage(req, res, currentPage, targetPage);
        req.session.pageBody = res.locals.pageBody = targetPage;

        res.render('index', { title: `${action === 'previous' ? 'Previous' : 'Next'} Page: ${targetPage}` });
    }
    public prepNextPage(req: Request, res: Response, currentPage: string, targetPage: string): void {
        // Test the current page and decide which function to call
        switch (targetPage) {
            case 'page1':
                // Process form data for page1 if needed
                this.processCheckinOrCheckout(req, res);
                console.log('Preparing data for page1');
                break;
            case 'selectBoatToCheckout':
                // Process form data for page2 if needed
                console.log('Preparing data for page2');
                this.prepareSelectBoatToCheckoutPage(req, res);
                break;
            case 'whoAreYou':
                // Process form data for page3 if needed
                console.log('Preparing data for page3');
                this.prepareWhoAreYouPage(req, res);
                break;
            case 'startCheckIn':
                // Prepare data for the start of the check-in process
                console.log('Preparing data for startCheckIn');
                this.prepareCheckinPage(req, res);
                break;
            case 'checkInComplete':
                // Prepare data for the check-in complete page
                console.log('Preparing data for checkInComplete');
                break;
            case 'recordEngineHours':
                // Prepare data for the record engine hours page
                console.log('Preparing data for recordEngineHours');
                break;
            case 'checkedOut':
                // Prepare data for the checked out page
                console.log('Preparing data for checkedOut');
                // You can add any additional data preparation here if needed
                this.prepareCheckedOutPage(req, res);
                break;
            default:
                // If the target page is not recognized, default to page1
                console.log(`Unknown page: ${targetPage}, defaulting to page1`);
                res.locals.pageBody = 'page1';
                req.session.pageBody = res.locals.pageBody;
                break;
        }
    }


    public processIncommingForm(req: Request, res: Response, currentPage: string): void {
        // Test the current page and decide which function to call
        switch (currentPage) {
            case 'page1':
                // Process form data for page1 if needed
                this.processCheckinOrCheckout(req, res);
                console.log('Processing form data for page1');
                break;
            case 'selectBoatToCheckout':
                // Process form data for page2 if needed
                console.log('Processing form data for selectBoatToCheckout');
                this.processBoatSelection(req, res);
                break;
            case 'page3':
                // Process form data for page3 if needed
                console.log('Processing form data for page3');
                break;
        }
    }
    processBoatSelection(req: Request, res: Response) {
        // get the boat id from the request body
        const boatId = req.body.boat;
        if (boatId) {
            // If a boat is selected, set the session variable boatId
            dao.boatManager.checkOutBoat(boatId);
            req.session.theBoat = dao.boatManager.getBoatById(boatId);
            console.log(`Boat with ID ${boatId} checked out.`);
        }
    }

    processCheckinOrCheckout(req: Request, res: Response) {
        // Test if the check_in attribute is present in the request body
        if (req.body.check_in === 'true') {
            // If it is, set the session variable checkIn to true
            req.session.checkIn = true;
            console.log('Check-in mode enabled');
        } else {
            // If it is not, set the session variable checkIn to false
            req.session.checkIn = false;
            console.log('Check-in mode disabled');
        }
    }

    public prepareSelectBoatToCheckoutPage(req: Request, res: Response) {
        // build a list of boats with name and id and pass it to the view
        const boats = dao.boatManager.getAvailableBoats();
        res.locals.boats = boats;
        // If there are no boats available, set the pageBody to 'noBoatsAvailable'
        if (boats.length === 0) {
            res.locals.message = 'Sorry: all boats are currently checked out!';
            console.log('No boats available for checkout');
        }

    }

    public prepareWhoAreYouPage(req: Request, res: Response): void {
        // build a list of people with name and id and pass it to the view
        const people = dao.personManager.getPersons()
        res.locals.people = people;
    }

    prepareCheckinPage(req: Request, res: Response) {

        const boats = dao.boatManager.getCheckedOutBoats();
        res.locals.boats = boats;
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


