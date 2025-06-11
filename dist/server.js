"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Set the views directory
app.use(express_1.default.static('public')); // Serve static files from the public directory
// Set up the public directory for static files
app.use('/public', express_1.default.static('public'));
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Set up session management
app.use((0, express_session_1.default)({
    secret: 'a we1rd2va200lue3',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// Set up body parser for form submissions
app.use(express_1.default.urlencoded({ extended: true }));
// Set up routes
(0, index_1.setRoutes)(app);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
