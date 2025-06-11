import { Router } from 'express';
import { IndexController } from '../controllers';

const router = Router();
const indexController = new IndexController();

export function setRoutes(app: any) {
    app.use('/', router);
    router.get('/', indexController.getHome.bind(indexController));
    router.get('/about', indexController.getAbout.bind(indexController));
    router.post('/navigate', indexController.navigate.bind(indexController));
}