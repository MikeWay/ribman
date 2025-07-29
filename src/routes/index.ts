import { Router } from 'express';
import { IndexController } from '../controllers';
import { NavigationController } from '../controllers/NavigationController';
import { adminController } from '../controllers/AdminController';
import multer from 'multer';
import { apiServer } from '../api/server';
import { expressjwt } from 'express-jwt';
import fs from 'fs';
import path from 'path';

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
    router.get('/admin', adminController.getHome.bind(adminController));
    router.post('/checkInAll', adminController.checkInAllBoats.bind(adminController));
    router.get('/admin/loadUsers', adminController.loadUsers.bind(adminController));
    router.get('/admin/deleteAllUsers', adminController.deleteAllUsers.bind(adminController));
    router.post('/admin/upload-users', upload.single('csvFile'), adminController.uploadUsers.bind(adminController));
    router.post('/api/check-person', checkIfAuthenticated, apiServer.checkPerson.bind(apiServer));
    router.post('/api/check-out-boat', checkIfAuthenticated, apiServer.checkOutBoat.bind(apiServer));
    router.get('/api/available-boats', checkIfAuthenticated, apiServer.getAvailableBoats.bind(apiServer));
    router.get('/api/checked-out-boats', checkIfAuthenticated, apiServer.getCheckedOutBoats.bind(apiServer));
    router.post('/api/login', apiServer.login.bind(apiServer));
}



const checkIfAuthenticated = expressjwt({
    secret: RSA_PUBLIC_KEY,
    algorithms: ['RS256']
}); 