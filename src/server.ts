import express from 'express';
import { setRoutes } from './routes/index';
import session from 'express-session';
import cors from 'cors';
import audit from 'express-requests-logger'

const app = express();
const PORT = process.env.PORT || 3000;

// Set up the view engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Set the views directory
app.use(express.static('public')); // Serve static files from the public directory
// Set up the public directory for static files
app.use('/public', express.static('public'));   

// Middleware
app.use(audit());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Set up session management
app.use(session({
        secret: 'a we1rd2va200lue3',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    }));
// Set up body parser for form submissions
app.use(express.urlencoded({ extended: true }));         
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
// Set up routes
setRoutes(app);

// Start the server
//app.use(cors(corsOptions));
// app.options('*', cors(corsOptions))
// app.post('*', cors(corsOptions))

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});