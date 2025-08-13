import { LogEntry } from "../model/log";

declare module 'express-session' {
    interface SessionData {
        pageBody?: string;
        checkIn?: boolean;
        theBoatId?: string;
        userName?: string;
        logEntry?: LogEntry; // Adjust the type as needed
    }
}