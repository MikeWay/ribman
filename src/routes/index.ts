import { Router } from 'express';
import { IndexController } from '../controllers';
import { NavigationController } from '../controllers/NavigationController';
import { adminController } from '../controllers/AdminController';

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
}