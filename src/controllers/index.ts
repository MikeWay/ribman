import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import session from 'express-session';
import { ParsedQs } from 'qs';

// Extend the SessionData interface to include pageBody
declare module 'express-session' {
    interface SessionData {
        pageBody?: string;
        checkIn?: boolean;
    }
}


export class IndexController {
    // a bi-directional list of page transitions
    // This is a simple state machine to manage page transitions
    // The keys are the current page, and the values are the next page
    // This allows for easy navigation between pages        
    private pageTransitionsCheckOut: { [key: string]: string } = {
        'page1': 'page2',
        'page2': 'page3',
        'page3': 'checkedOut' // Loop back to page1
    };

    private pageTransitionsCheckIn: { [key: string]: string } = {
        'page1': 'startCheckIn',
        'startCheckIn': 'checkInComplete', // Start Check-In page
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
                this.processPage1Data(req, res);
                console.log('Preparing data for page1');
                break;
            case 'page2':
                // Process form data for page2 if needed
                console.log('Preparing data for page2');
                this.preparePage2(req, res);
                break;
            case 'page3':
                // Process form data for page3 if needed
                console.log('Preparing data for page3');
                this.preparePage3(req, res);
                break;
        }
    }

    public processIncommingForm(req: Request, res: Response, currentPage: string): void {
        // Test the current page and decide which function to call
        switch (currentPage) {
            case 'page1':
                // Process form data for page1 if needed
                this.processPage1Data(req, res);
                console.log('Processing form data for page1');
                break;
            case 'page2':
                // Process form data for page2 if needed
                console.log('Processing form data for page2');
                break;
            case 'page3':
                // Process form data for page3 if needed
                console.log('Processing form data for page3');
                break;
        }
    }

    processPage1Data(req: Request, res: Response) {
        // Test if the check_in attribute is present in the request body
        if (req.body.check_in) {
            // If it is, set the session variable checkIn to true
            req.session.checkIn = true;
            console.log('Check-in mode enabled');
        }
        else {
            // If it is not, set the session variable checkIn to false
            req.session.checkIn = false;
            console.log('Check-in mode disabled');
        }
    }

    public preparePage2(req: Request, res: Response) {
        // build a list of boats with name and id and pass it to the view
        const boats = [
            { id: 1, name: 'Blue Rib' },
            { id: 2, name: 'Grey Rib' },
            { id: 3, name: 'Spare Rib' },
            { id: 4, name: 'Tornado II' }
        ];
        res.locals.boats = boats;
        res.locals.pageBody = 'page2';

    }

    public preparePage3(req: Request, res: Response): void {
        // build a list of people with name and id and pass it to the view
        const people = [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' },
            { id: 3, name: 'Alice Johnson' },
            { id: 4, name: 'Bob Brown' }
        ];
        res.locals.people = people;
        res.locals.pageBody = 'page3';
    }
}


