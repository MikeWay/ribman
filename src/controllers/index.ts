import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import session from 'express-session';
import { ParsedQs } from 'qs';

// Extend the SessionData interface to include pageBody
declare module 'express-session' {
    interface SessionData {
        pageBody?: string;
    }
}


export class IndexController {
    // a bi-directional list of page transitions
    // This is a simple state machine to manage page transitions
    // The keys are the current page, and the values are the next page
    // This allows for easy navigation between pages        
    private pageTransitions: { [key: string]: string } = {
        'page1': 'page2',
        'page2': 'page3',
        'page3': 'page1' // Loop back to page1
    };
    public getHome(req: Request, res: Response): void {
        res.locals.pageBody = 'page1';
        // render the page1 view with the usernames 
        res.render('index', { title: 'Page 1' });
    }

    public getAbout(req: Request, res: Response): void {
        res.send('This is the About Page');
    }

       
    public navigate(req: Request, res: Response): void {
        const currentPage = req.session.pageBody || 'page1';
        const action = req.method === 'POST' ? req.body.action as string : req.query.action as string || 'next';

        let targetPage: string;

        if (action === 'previous') {
            targetPage = Object.keys(this.pageTransitions).find(
                key => this.pageTransitions[key] === currentPage
            ) || 'page1';
        } else {
            targetPage = this.pageTransitions[currentPage] || 'page1';
            
        }    
        this.processForm_PrepNextPage(req, res, currentPage, targetPage);
        req.session.pageBody = res.locals.pageBody = targetPage;

        res.render('index', { title: `${action === 'previous' ? 'Previous' : 'Next'} Page: ${targetPage}` });
    }
    public processForm_PrepNextPage(req: Request, res: Response, currentPage: string, targetPage: string): void {
        // Test the current page and decide which function to call
        switch (targetPage) {
            case 'page1':
                // Process form data for page1 if needed
                console.log('Processing form data for page1');
                break;
            case 'page2':
                // Process form data for page2 if needed
                console.log('Processing form data for page2');
                this.preparePage2(req, res);
                break;
            case 'page3':
                // Process form data for page3 if needed
                console.log('Processing form data for page3');
                this.preparePage3(req, res);
                break;
    }}
    public preparePage2(req: Request, res: Response): void {
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


