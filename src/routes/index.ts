import { Router } from 'express';
import { IndexController } from '../controllers';
import { NavigationController } from '../controllers/NavigationController';

const router = Router();
const indexController = new IndexController();
const navigationController = new NavigationController()

export function setRoutes(app: any) {
    app.use('/', router);
    router.get('/', indexController.getHome.bind(indexController));
    router.post('/navigate', navigationController.navigate.bind(navigationController));
}