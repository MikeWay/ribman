import { Router } from 'express';
import { IndexController } from '../controllers';
import { NavigationController } from '../controllers/NavigationController';
import { adminController } from '../controllers/AdminController';
import multer from 'multer';
import { apiServer } from '../api/server';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    router.post('/api/check-person', apiServer.checkPerson.bind(apiServer));
}