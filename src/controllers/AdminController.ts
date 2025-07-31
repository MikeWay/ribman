import { dao } from "../model/dao";
import { logManager } from "../model/LogManager";
import { Request, Response } from 'express';
import multer from 'multer';
import { Person } from "../model/Person";
import { RSA_PRIVATE_KEY } from "../api/server";
import jwt from 'jsonwebtoken';

// Extend Express Request type to include file property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}


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
                    const csvRows = [];
                    const headers = ["boatName", "personName", "checkOutDateTime", "checkInDateTime", "checkOutReason"];
                    csvRows.push(headers.join(','));
                    for (const log of logs) {
                        // Convert log entry to CSV row
                        // Ensure to handle any potential undefined/null values
                        // Convert checkOutDateTime and checkInDateTime to a readable format
                        const formattedCheckOutDateTime = log.checkOutDateTime ? new Date(log.checkOutDateTime).toISOString() : '';
                        const formattedCheckInDateTime = log.checkInDateTime ? new Date(log.checkInDateTime).toISOString() : '';
                        // Create a CSV row
                        // Escape quotes in the log values
                        // Create a row with escaped values
                        // Ensure to handle any potential undefined/null values
                        // Use map to create a row with escaped values
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars   
                        const row = headers.map(h => {
                            if (h === 'checkOutDateTime') {
                                return `"${formattedCheckOutDateTime.replace(/"/g, '""')}"`;
                            }
                            if (h === 'checkInDateTime') {
                                return `"${formattedCheckInDateTime.replace(/"/g, '""')}"`;
                            }
                            return `"${(log[h] ?? '').toString().replace(/"/g, '""')}"`;
                        });
                        csvRows.push(row.join(','));
                    }
                    res.setHeader('Content-Type', 'text/csv');
                    res.status(200)
                        .setHeader('Content-Disposition', 'attachment; filename="log_report.csv"')
                        .send(csvRows.join('\n'));
                    res.end();
                    // Optionally, you can log or set a message after sending the file
                    console.log('CSV log report sent successfully.');
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
        res.render('adminPage', { title: 'Admin' });
    }

    public adminLogin(req: Request, res: Response): void {
        res.locals.pageBody = 'adminLogin';
        req.session.pageBody = res.locals.pageBody;
        // render the adminLogin view
        res.render('adminLogin', { title: 'Admin' });
    }

    // method to handle admin login
    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;       
        try {
            const admin = await dao.personManager.getAdminByEmailAndPassword(email, password);
            if (admin) {
                //req.session.user = admin; // Store user in session
                // create a jwt token for the admin


        const jwtBearerToken = jwt.sign({isAdmin: true}, RSA_PRIVATE_KEY, {
                algorithm: 'RS256',
            });



            res.cookie('jwt', jwtBearerToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

            //res.redirect(301,'/admin'); // Redirect to admin home
this.getHome(req, res); // Render the admin home page         
            } else {
                res.status(401).json({ error: 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public loadUsers(req: Request, res: Response): void {
        res.locals.pageBody = 'adminLoadUsers';
        req.session.pageBody = res.locals.pageBody;
        // render the adminLoadUsers view
        res.render('index', { title: 'Load Users' });
    }

    deleteAllUsers(req: Request, res: Response): void {
        dao.personManager.deleteAllPersons()
            .then(() => {
                res.status(200).json({ message: 'All users deleted successfully.' });
            })
            .catch((error) => {
                console.error('Error deleting all users:', error);
                res.status(500).json({ error: 'Failed to delete all users' });
            });
    }
    
    // Method to handle file upload and process CSV data
    // Expect the CSV to have columns: id, firstName, lastName, dob
    
    public async uploadUsers(req: MulterRequest, res: Response): Promise<void> {
        try {
            // handle file upload 
            if (!req.file) {
                res.locals.pageBody = 'error';
                res.render('index', { title: 'Error', message: 'No file uploaded' });
                return;
            }
            const csvData = req.file.buffer.toString('utf-8'); 
            // Process the CSV file from the buffer line by line
            const lines = csvData.split('\n').filter(line => line.trim() !== '');
            // Assuming the first line is the header
            const header = lines[0].split(',').map(h => h.trim());

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== header.length) continue; // skip malformed lines
                // split values[4] (e.g., "1990-01-01") into day, month, year
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [year, month, day] = values[3].split('-').map(v => parseInt(v, 10));
                // Create a new Person object
                const person = new Person(values[0], values[1], values[2], month, day, year);

                await dao.personManager.savePerson(person);
            }

            res.status(200).json({ message: 'Users uploaded successfully' });

        }   catch (error) {
            console.error('Error uploading users:', error);
            res.status(500).json({ error: 'Failed to upload users' });
        }
    }
    
}

export const adminController = new AdminController();


