"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
const indexController = new controllers_1.IndexController();
function setRoutes(app) {
    app.use('/', router);
    router.get('/', indexController.getHome.bind(indexController));
    router.get('/about', indexController.getAbout.bind(indexController));
    router.post('/navigate', indexController.navigate.bind(indexController));
}
exports.setRoutes = setRoutes;
