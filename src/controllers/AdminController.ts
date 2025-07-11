import { dao } from "../model/dao";
import { logManager } from "../model/LogManager";
import { Request, Response } from 'express';

export class AdminController {
    constructor() {
        // Initialization code if needed
    }

    // Example method
    public async genLogReports(req: Request, res: Response): Promise<void> {
        try {
            // Your logic here
            logManager.listLogEntries()
                .then((logs) => {
                    res.status(200).json(logs);
                })
                .catch((error) => {
                    console.error('Error fetching logs:', error);
                    res.status(500).json({ error: 'Failed to fetch logs' });
                })
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public async checkInAllBoats(req: Request, res: Response): Promise<void> {
        // TODO: Implement the logic for checking in all boats
        await dao.boatManager.checkInAllBoats();
        res.status(200).json({ message: 'All boats checked in.' });
    }

    public getHome(req: Request, res: Response): void {
        res.locals.pageBody = 'adminPage';
        req.session.pageBody = res.locals.pageBody;
        // render the page1 view with the usernames 
        res.render('index', { title: 'Admin' });
    }
}

export const adminController = new AdminController();


