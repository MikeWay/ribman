import { Router  } from 'express';
import { IndexController } from '../controllers';
import { NavigationController } from '../controllers/NavigationController';
import { adminController } from '../controllers/AdminController';
import multer from 'multer';
import { apiServer } from '../api/server';
import { expressjwt, Request } from 'express-jwt';

import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const absolutePath = path.resolve(__dirname, '../keys/public.key');
console.log("Absolute path to public key:", absolutePath);
const RSA_PUBLIC_KEY = fs.readFileSync(absolutePath, 'utf8');

const router = Router();
const indexController = new IndexController();
const navigationController = new NavigationController()

export function setRoutes(app: any) {
    app.use('/', router);
    router.get('/', indexController.getHome.bind(indexController));
    router.post('/navigate', navigationController.navigate.bind(navigationController));
    router.get('/report', adminController.genLogReports.bind(adminController));
    router.get('/admin', checkIfAdminAuthenticated, adminController.getHome.bind(adminController));
    router.post('/checkInAll', checkIfAdminAuthenticated, adminController.checkInAllBoats.bind(adminController));
    router.get('/admin/loadUsers', checkIfAdminAuthenticated, adminController.loadUsers.bind(adminController));
    router.get('/admin/deleteAllUsers', checkIfAdminAuthenticated, adminController.deleteAllUsers.bind(adminController));
    router.post('/admin/upload-users', checkIfAdminAuthenticated, upload.single('csvFile'), adminController.uploadUsers.bind(adminController));
    router.post('/api/check-person', checkIfAuthenticated, apiServer.checkPerson.bind(apiServer));
    router.post('/api/check-out-boat', checkIfAuthenticated, apiServer.checkOutBoat.bind(apiServer));
    router.get('/api/available-boats', checkIfAuthenticated, apiServer.getAvailableBoats.bind(apiServer));
    router.get('/api/checked-out-boats', checkIfAuthenticated, apiServer.getCheckedOutBoats.bind(apiServer));
    router.post('/api/login', apiServer.login.bind(apiServer));
    router.get('/admin-login', adminController.adminLogin.bind(adminController));
    router.post('/admin/login', adminController.login.bind(adminController));
}



const checkIfAuthenticated = expressjwt({
    secret: RSA_PUBLIC_KEY,
    algorithms: ['RS256'],
    getToken: (req) => {

        const token = req.headers.authorization?.split(' ')[1];
        return token || undefined;


    }
});


interface AuthCookiePayload {
    isAdmin?: boolean;
    [key: string]: any;
}

function checkIfAdminAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
){
    if (!req.cookies) {
        console.log('Unauthorized: Cookies not found');
        throw new Error('NOT-ADMIN');
        }
    const authCookie: string | undefined = req?.cookies['jwt'];
    if (!authCookie) {
        console.log('Unauthorized: JWT not found');
        throw new Error('NOT-ADMIN');
    }
    // Verify the JWT token
    jwt.verify(
        authCookie,
        RSA_PUBLIC_KEY,
        (err, decoded) => {
            // decoded can be string | JwtPayload
            let isAdmin = false;
            if (typeof decoded === 'object' && decoded !== null && 'isAdmin' in decoded) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isAdmin = Boolean((decoded as any).isAdmin);
            }
            if (err || !isAdmin) {
                throw new Error('NOT-ADMIN');
                //return res.status(403).json({ error: 'Forbidden' });
            }
            // If the token is valid and the user is an admin, proceed
            next();
        }
    );
}

// const checkIfAdminAuthenticated = expressjwt({
//     secret: RSA_PUBLIC_KEY,
//     algorithms: ['RS256'],
//     getToken: (req: Request) => {

//         const token = req.headers.authorization?.split(' ')[1];
//         if(!req.auth?.isAdmin) {
//             throw new Error('NOT-ADMIN');
//             //return undefined;
//         }
//         return token || undefined;
       
//     }
// }); 