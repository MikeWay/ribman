import { dao } from "../model/dao";
import { logManager } from "../model/LogManager";
import { Request, Response } from 'express';
import { Person } from "../model/Person";
import { RSA_PRIVATE_KEY } from "../api/server";
import jwt from 'jsonwebtoken';
import { LogEntry } from "../model/log";
import { AdminPerson } from "../model/AdminPerson";
import { EngineHours } from "../model/EngineHours";
import { Boat } from "../model/Boat";
import { DefectsForBoat } from "../model/defect";

// Extend Express Request type to include file property
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

declare module 'express-session' {
    interface SessionData {
        pageBody?: string;
        checkIn?: boolean;
        theBoatId?: string;
        userName?: string;
        logEntry?: LogEntry; // Adjust the type as needed
        user?: AdminPerson; // Add user property to session
    }
}



export class AdminController {

    public adminLogin(req: Request, res: Response): void {
        res.locals.pageBody = 'adminLogin';
        req.session.pageBody = res.locals.pageBody;
        // render the adminLogin view
        res.render('index', { title: 'Admin' });
    }

    public adminLogout(req: Request, res: Response): void {
        dao.tokenStore.delete(req.session.user?.email_address || '');
        res.locals.pageBody = 'adminLogin';
        req.session.pageBody = res.locals.pageBody;
        // render the adminLogin view
        res.render('index', { title: 'Admin' });
    }

    public async boatsWithIssues(req: Request, res: Response): Promise<void> {
        const boatsWithIssues = await dao.identifyBoatsWithIssues();
        res.locals.boatsWithIssues = boatsWithIssues;
        res.locals.pageBody = 'adminBoatsWithIssues';
        req.session.pageBody = res.locals.pageBody;
        // render the adminBoatsWithIssues view
        try {
            res.render('index', { title: 'Admin - Boats with Issues' });
        } catch (error) {
            console.error('Error rendering adminBoatsWithIssues view:', error);
            res.status(500).render('error', { title: 'Admin - Boats with Issues', error: 'Failed to render view' });
        }
    }


    public async boatsCheckedOut(req: Request, res: Response): Promise<void> {
        const boatsCheckedOut = await dao.boatManager.getCheckedOutBoats();
        res.locals.boatsCheckedOut = boatsCheckedOut;
        res.locals.pageBody = 'adminBoatsCheckedOut';
        req.session.pageBody = res.locals.pageBody;
        // render the adminBoatsCheckedOut view
        try {
            res.render('index', { title: 'Admin - Boats Checked Out' });
        } catch (error) {
            console.error('Error rendering adminBoatsCheckedOut view:', error);
            res.status(500).render('error', { title: 'Admin - Boats Checked Out', error: 'Failed to render view' });
        }
    }

    public async checkInAllBoats(req: Request, res: Response): Promise<void> {
        // TODO: Implement the logic for checking in all boats
        await dao.boatManager.checkInAllBoats();
        res.locals.task = "Check in all Boats";
        res.locals.pageBody = 'taskComplete';
        req.session.pageBody = res.locals.pageBody;
        res.render('index', { title: 'Admin' });
    }

    public async clearAllBoatFaults(req: Request, res: Response): Promise<void> {
        await dao.defectManager.clearAllBoatFaults();
        res.locals.task = "Clear all Boat Faults";
        res.locals.pageBody = 'taskComplete';
        req.session.pageBody = res.locals.pageBody;
        res.render('index', { title: 'Admin' });
    }

    public async confirmDefectCleared(req: Request, res: Response): Promise<void> {
        const { defectId, boatId, confirm } = req.body;
        req.params.boatId = boatId;
        
        if (confirm === 'yes') {
            console.log(`Defect confirmed cleared: ${defectId} for boat: ${boatId}`);
            // TODO Implement the logic to perform the defect clearance
            const defectsForBoat: DefectsForBoat | null = await dao.defectManager.loadDefectsForBoat(boatId);
            defectsForBoat?.clearDefect(defectId);
            if(defectsForBoat && !defectsForBoat.hasDefects()) {
                dao.defectManager.deleteDefectsForBoat(defectsForBoat);
            } else {
                await dao.defectManager.saveDefectsForBoat(defectsForBoat!);
            }

            //defectsForBoat?.clearDefect(defectId);
        } else {
            console.log(`Defect clearance cancelled: ${defectId} for boat: ${boatId}`);
        }
        this.defectsForBoat(req, res);
    }

    public checkIfDefectToBeCleared(req: Request, res: Response): void {
        const { reportedDefectId, boatId, defectName } = req.body;
        // Implement the logic to mark the defect as cleared
        console.log(`Defect cleared: ${reportedDefectId} for boat: ${boatId}`);
        res.locals.defectId = reportedDefectId;
        res.locals.boatId = boatId;
        res.locals.task = "Defect Cleared";
        res.locals.pageBody = 'confirmDefectCleared';
        res.locals.defectName = defectName;
        req.session.pageBody = res.locals.pageBody;
        res.render('index', { title: 'Admin' });
    }

    public async defectsForBoat(req: Request, res: Response): Promise<void> {
        const boatId = req.params.boatId || req.url.split('/').pop();
        if (!boatId) {
            res.status(400).render('error', { title: 'Defects for Boat', error: 'Boat ID is required' });
            return;
        }
        const defectsForBoat: DefectsForBoat | null = await dao.defectManager.loadDefectsForBoat(boatId);
        if (!defectsForBoat) {
            this.boatsWithIssues(req, res);
            return;
        }
        const boat = await dao.boatManager.getBoatById(boatId);
        res.locals.defectsForBoat = defectsForBoat;
        res.locals.boat = boat;
        res.locals.pageBody = 'adminDefectsForBoat';
        req.session.pageBody = res.locals.pageBody;
        // render the adminDefectsForBoat view
        //console.log("Rendering defectsForBoat view for boatId:", boatId, "defectsForBoat:", JSON.stringify(defectsForBoat));
        res.render('index', { title: 'Defects for Boat', defectsForBoat: res.locals.defectsForBoat });
    }

    async deleteAdminUser(req: Request, res: Response): Promise<void> {
        const email = req.body.email_address;
        try {
            await dao.adminPersonManager.deletePerson(email);
            res.locals.task = "Delete Admin User";
            res.locals.pageBody = 'taskComplete';
            res.render('index', { title: 'Admin' });
        } catch (error) {
            console.error('Error deleting admin user:', error);
            res.status(500).json({ error: 'Failed to delete admin user' });
        }
    }

    async deleteAllUsers(req: Request, res: Response): Promise<void> {
        try {
            await dao.personManager.deleteAllPersons();
            res.locals.task = "Delete All Users";
            res.locals.pageBody = 'taskComplete';
            res.render('index', { title: 'Admin' });
        } catch (error) {
            console.error('Error deleting all users:', error);
            res.status(500).json({ error: 'Failed to delete all users' });
        }
    }

    public getHome(req: Request, res: Response): void {
        res.locals.pageBody = 'adminPage';
        req.session.pageBody = res.locals.pageBody;
        // render the page1 view with the usernames 
        res.render('index', { title: 'Admin' });
    }

    public async genLogReports(req: Request, res: Response): Promise<void> {
        try {
            // Your logic here
            const logs = await logManager.listLogEntries();
            const csvRows = [];
            const headers = ["action", "boatName", "personName", "checkOutDateTime", "checkInDateTime", "checkOutReason", "defect", "additionalInfo"];
            csvRows.push(headers.join(','));
            for (const log of logs) {
                const formattedCheckOutDateTime = log.checkOutDateTime ? new Date(log.checkOutDateTime).toISOString() : '';
                const formattedCheckInDateTime = log.checkInDateTime ? new Date(log.checkInDateTime).toISOString() : '';
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
            console.log('CSV log report sent successfully.');

        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    public inputAddAdminUser(req: Request, res: Response): any {
        res.locals.pageBody = 'adminAddUser';
        req.session.pageBody = res.locals.pageBody;
        // render the adminAddUser view
        res.render('index', { title: 'Add Admin User' });
    }

    public async inputAdminPassword(req: Request, res: Response): Promise<void> {
        const { email_address } = req.query as { email_address: string };
        const admin = await dao.adminPersonManager.getAdminByEmail(email_address);
        // Set the page body in the session
        req.session.pageBody = res.locals.pageBody;
        //res.render('adminSetPassword', { title: 'Set Admin Password', email_address });
        res.render('adminSetPassword', { title: 'Set Admin Password', email_address, user: admin, error: null });
    }

    public async listUsers(req: Request, res: Response): Promise<void> {
        try {
            res.locals.pageBody = 'adminListUsers';
            // Fetch all users from the database
            res.locals.users = await dao.adminPersonManager.getAllPersons();
        } catch (error) {
            console.error('Error fetching users:', error);
            res.locals.error = 'Failed to fetch users';
        }
        // Set the page body in the session
        req.session.pageBody = res.locals.pageBody;
        // render the adminListUsers view
        res.render('index', { title: 'List Users', users: res.locals.users, error: res.locals.error });
    }

    // method to handle admin login
    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const admin = await dao.adminPersonManager.getAdminByEmail(email);
            const isValid = await admin?.validatePassword(password);
            if (isValid) {
                // create a jwt token for the admin
                const jwtBearerToken = jwt.sign({ user: admin, isAdmin: true }, RSA_PRIVATE_KEY, {
                    algorithm: 'RS256',
                });
                // Store the token in the token store
                if (admin?.email_address) {
                    dao.tokenStore.set(admin.email_address, jwtBearerToken);
                }
                // Send token to browser as a cookie
                res.cookie('jwt', jwtBearerToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
                this.getHome(req, res); // Render the admin home page         
            } else {
                res.render('error', { error: 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            res.render('error', { error: 'Invalid email or password' });
        }
    }

    public loadNewUsers(req: Request, res: Response): void {
        res.locals.pageBody = 'adminLoadUsers';
        req.session.pageBody = res.locals.pageBody;
        // render the adminLoadUsers view
        res.render('index', { title: 'Load Users' });
    }

    public async reportEngineHours(req: Request, res: Response): Promise<void> {
        // load engine hours for all boats
        let engineHours: EngineHours[] = await dao.engineHoursManager.loadAllEngineHoursForAllBoats();
        engineHours = dao.engineHoursManager.sortEngineHoursByReason(engineHours);
        res.locals.engineHours = engineHours;
        res.locals.pageBody = 'adminReportEngineHours';
        req.session.pageBody = res.locals.pageBody;
        // render the adminReportEngineHours view
        res.render('index', { title: 'Admin - Report Engine Hours' });
    }

    public async reportEngineHoursByUseByBoat(req: Request, res: Response): Promise<void> {
        const boatMap = new Map<string, EngineHours[]>();
        const boatTotalsMap = new Map<string, number>();
        // Get a list of all the boats
        let boats: Boat[] = await dao.boatManager.listBoats();
        // for each boat
        for (const boat of boats) {
            // load engine hours for all boats
            let engineHours: EngineHours[] = await dao.engineHoursManager.getEngineHoursByBoatId(boat.id);
            let engineHoursMap = dao.engineHoursManager.mergeEngineHoursByReason(engineHours);

            boatMap.set(boat.name, engineHoursMap);

            const totalHours = engineHoursMap.values().reduce((sum: number, hours: number) => {
                return sum + hours;
            }, 0);
            boatTotalsMap.set(boat.name, totalHours);
        }
        res.locals.boatMap = boatMap;
        res.locals.boatTotalsMap = boatTotalsMap;
        res.locals.pageBody = 'adminReportEngineHoursByUseByBoat';
        req.session.pageBody = res.locals.pageBody;
        // render the adminReportEngineHours view
        res.render('index', { title: 'Admin - Report Engine Hours by Use Group' });
    }

    public async reportEngineHoursByUserGroup(req: Request, res: Response): Promise<void> {
        // load engine hours for all boats
        let engineHours: EngineHours[] = await dao.engineHoursManager.loadAllEngineHoursForAllBoats();
        let engineHoursMap = dao.engineHoursManager.mergeEngineHoursByReason(engineHours);
        res.locals.engineHoursMap = engineHoursMap;
        const totalHours = engineHoursMap.values().reduce((sum: number, hours: number) => {
            return sum + hours;
        }, 0);
        res.locals.totalEngineHours = totalHours;

        res.locals.pageBody = 'adminReportEngineHoursByUserGroup';
        req.session.pageBody = res.locals.pageBody;
        // render the adminReportEngineHours view
        res.render('index', { title: 'Admin - Report Engine Hours by User Group' });
    }

    public async reportEngineHoursForBoat(req: Request, res: Response): Promise<void> {
        // load engine hours for specifc boat
    }

    public async saveNewAdminUser(req: Request, res: Response): Promise<void> {
        // Implement the logic to save a new admin user
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;
        try {

            const newUser = new AdminPerson(email, firstName, lastName);
            await newUser.setPassword(password); // setPassword hashes the password
            await dao.adminPersonManager.saveAdminPerson(newUser);
            res.redirect('/admin/listUsers');
        } catch (error) {
            console.error('Error creating admin user:', error);
            res.render('error', { title: 'Add Admin User', error: 'Failed to create admin user' });
        }
    }

    public async setAdminPassword(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const admin = await dao.adminPersonManager.getAdminByEmail(email);
            if (admin) {
                // Update the admin's password
                await admin.setPassword(password); // Assuming password is stored in plain text, which is not recommended
                await dao.adminPersonManager.saveAdminPerson(admin);
                res.status(200).json({ message: 'Password updated successfully' });
            } else {
                res.status(404).json({ error: 'Admin not found' });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
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
                const [year, month, day] = values[3].split('-').map(v => parseInt(v, 10));
                // Create a new Person object
                const person = new Person(values[0], values[1], values[2], month, day, year);

                await dao.personManager.savePerson(person);
            }

            res.status(200).json({ message: 'Users uploaded successfully' });

        } catch (error) {
            console.error('Error uploading users:', error);
            res.status(500).json({ error: 'Failed to upload users' });
        }
    }

}

export const adminController = new AdminController();
