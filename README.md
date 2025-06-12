# Node.js Server Project

This project is a simple Node.js server built using TypeScript. It serves as a template for creating RESTful APIs and demonstrates the structure of a typical Node.js application.

## Project Structure

```
nodejs-server
├── src
│   ├── server.ts          # Entry point of the application
│   ├── controllers        # Contains controller classes
│   │   └── index.ts      # Exports IndexController
│   ├── routes             # Contains route definitions
│   │   └── index.ts      # Exports setRoutes function
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

- **GET /** - Returns the home page.
- **GET /about** - Returns information about the application.

## Contributing

Feel free to submit issues or pull requests for any improvements or features you would like to see in this project.

## Run on server
use forever bin/server.js from the app root dir