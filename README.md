# Node.js Server Project

Server component of the boat manager application.
Provides a set of API's to interface with DynamoDB tables holding the data


## Project Structure

```
nodejs-server
├── src
│   ├── server.ts          # Entry point of the application
│   ├── controllers        # Contains controller classes
│   │   └── index.ts      # Exports IndexController
│   ├── routes             # Contains route definitions
│   │   └── routes.ts      # Exports setRoutes function
│   └── types              # Contains type definitions
│       └── index.ts      # Exports Request and Response interfaces
├── package.json           # NPM configuration file
├── tsconfig.json          # TypeScript configuration file
└── README.md              # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nodejs-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile TypeScript files:**
   ```bash
   npm run build
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

## Usage

Once the server is running, you can access the following routes:

/api/* routes are the web service interfaces
/admin/* routes are for the admin we interface


## Contributing

Feel free to submit issues or pull requests for any improvements or features you would like to see in this project.

## Run on server
use forever bin/server.js from the app root dir

## Routes
/**
 * Sets up all application routes for the Express app.
 *
 * ## Routes
 *
 * - `GET /report`  
 *   Generates log reports.  
 *   Controller: `adminController.genLogReports`
 *
 * - `GET /admin`  
 *   Admin home page. Requires admin authentication.  
 *   Controller: `adminController.getHome`
 *
 * - `POST /checkInAll`  
 *   Checks in all boats. Requires admin authentication.  
 *   Controller: `adminController.checkInAllBoats`
 *
 * - `GET /admin/listUsers`  
 *   Lists all users. Requires admin authentication.  
 *   Controller: `adminController.listUsers`
 *
 * - `GET /admin/set-password`  
 *   Displays input for admin password. Requires admin authentication.  
 *   Controller: `adminController.inputAdminPassword`
 *
 * - `POST /admin/set-password`  
 *   Sets admin password. Requires admin authentication.  
 *   Controller: `adminController.setAdminPassword`
 *
 * - `GET /admin/loadUsers`  
 *   Loads new users. Requires admin authentication.  
 *   Controller: `adminController.loadNewUsers`
 *
 * - `GET /admin/deleteAllUsers`  
 *   Deletes all users. Requires admin authentication.  
 *   Controller: `adminController.deleteAllUsers`
 *
 * - `POST /admin/upload-users`  
 *   Uploads users from a CSV file. Requires admin authentication.  
 *   Middleware: `upload.single('csvFile')`  
 *   Controller: `adminController.uploadUsers`
 *
 * - `POST /api/check-person`  
 *   Checks a person's details. Requires authentication.  
 *   Controller: `apiServer.checkPerson`
 *
 * - `POST /api/check-out-boat`  
 *   Checks out a boat. Requires authentication.  
 *   Controller: `apiServer.checkOutBoat`
 *
 * - `POST /api/check-in-boat`  
 *   Checks in a boat. Requires authentication.  
 *   Controller: `apiServer.checkInBoat`
 *
 * - `GET /api/available-boats`  
 *   Gets available boats. Requires authentication.  
 *   Controller: `apiServer.getAvailableBoats`
 *
 * - `GET /api/checked-out-boats`  
 *   Gets checked out boats. Requires authentication.  
 *   Controller: `apiServer.getCheckedOutBoats`
 *
 * - `GET /api/defects-list`  
 *   Gets possible defects list. Requires authentication.  
 *   Controller: `apiServer.getPossibleDefectsList`
 *
 * - `POST /api/login`  
 *   API login endpoint.  
 *   Controller: `apiServer.login`
 *
 * - `GET /admin-login`  
 *   Admin login page.  
 *   Controller: `adminController.adminLogin`
 *
 * - `POST /admin/login`  
 *   Admin login action.  
 *   Controller: `adminController.login`
 *
 * @param app Express application instance
 */