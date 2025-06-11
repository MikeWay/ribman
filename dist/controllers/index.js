"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexController = void 0;
class IndexController {
    constructor() {
        // a bi-directional list of page transitions
        // This is a simple state machine to manage page transitions
        // The keys are the current page, and the values are the next page
        // This allows for easy navigation between pages        
        this.pageTransitions = {
            'page1': 'page2',
            'page2': 'page3',
            'page3': 'page1' // Loop back to page1
        };
    }
    getHome(req, res) {
        //res.send('Welcome to the Home Page');
        this.getPage1(req, res);
    }
    getAbout(req, res) {
        res.send('This is the About Page');
    }
    getPage1(req, res) {
        req.session.pageBody = 'page1'; // Set the initial pageBody in session
        // create a list of usernames
        const usernames = ['user1', 'user2', 'user3'];
        // pass the usernames to the view
        res.locals.usernames = usernames;
        // pass "page1" to the view
        res.locals.pageBody = 'page1';
        // render the page1 view with the usernames 
        res.render('index', { title: 'Page 1' });
    }
    navigate(req, res) {
        const currentPage = req.session.pageBody || 'page1';
        const action = req.query.action || 'next';
        let targetPage;
        if (action === 'previous') {
            targetPage = Object.keys(this.pageTransitions).find(key => this.pageTransitions[key] === currentPage) || 'page1';
        }
        else {
            targetPage = this.pageTransitions[currentPage] || 'page1';
            this.processForm_PrepNextPage(req, res, currentPage, targetPage);
        }
        req.session.pageBody = res.locals.pageBody = targetPage;
        res.render('index', { title: `${action === 'previous' ? 'Previous' : 'Next'} Page: ${targetPage}` });
    }
    processForm_PrepNextPage(req, res, currentPage, targetPage) {
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
        }
    }
    preparePage2(req, res) {
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
}
exports.IndexController = IndexController;
