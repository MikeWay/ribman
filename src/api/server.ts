import { Boat } from "../model/Boat";
import { dao } from "../model/dao";
import { Request, Response } from 'express';
import { Person } from "../model/Person";
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';


// write the current directory to the console
console.log("Current directory:", __dirname);
// convert the relative path to an absolute path
import path from 'path';
const absolutePath = path.resolve(__dirname, '../keys/private.key');
console.log("Absolute path to private key:", absolutePath);
const RSA_PRIVATE_KEY = fs.readFileSync(absolutePath, 'utf8');

class ApiServer {
  constructor() {
    this.init();
  }

  init() {
    console.log("Server initialized");
  }

  start() {
    console.log("Server started");
  }

  public async checkPerson(req: Request, res: Response) {
    // get json object from request
    // get month from the request
    const month = req.body.month || new Date().getMonth() + 1;
    // get day from the request
    const day = req.body.day || new Date().getDate();
    const year = req.body.year || 0;
    // get familyInitial from the request
    const familyInitial = req.body.familyInitial || '';


    try {
      const peopleFound = await dao.personManager.getPersonByLastNameAndBirthDate(
        familyInitial.toString(),
        Number(day),
        Number(month),
        Number(year)
      );
      return res.json(peopleFound);
    } catch (error) {
      console.error("Error in checkPerson:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  /** request includes: boat: Boat and user: Person  */
  public async checkOutBoat(req: Request, res: Response) {
    const boat: Boat = req.body.boat;
    const user: Person = req.body.user;

    // check out the boat
    try {
      boat.checkedOutTo = user.id;
      boat.checkedOutAt = new Date();
      boat.checkedInAt = null; // Reset checked-in time
      await dao.boatManager.checkOutBoat(boat);
      return res.status(200).json({ message: "Boat checked out successfully" });
    } catch (error) {
      console.error("Error checking out boat:", error);
      return res.status(500).json({ error: "Failed to check out boat" });
    }
  }

  // method to get a list of available boats
  public async getAvailableBoats(req: Request, res: Response) {
    try {
      const boats = await dao.boatManager.getAvailableBoats();
      return res.status(200).json(boats);
    } catch (error) {
      console.error("Error fetching available boats:", error);
      return res.status(500).json({ error: "Failed to fetch available boats" });
    }
  }

  // method to get a list of checked out boats
  public async getCheckedOutBoats(req: Request, res: Response) {
    try {
      const boats = await dao.boatManager.getCheckedOutBoats();
      return res.status(200).json(boats);
    } catch (error) {
      console.error("Error fetching checked out boats:", error);
      return res.status(500).json({ error: "Failed to fetch checked out boats" });
    }
  } 

  public login(req: Request, res: Response) {

    const email = req.body.email,
          password = req.body.password;

    if (validatePassword(password)) {
       const userId = '666';

        const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
                algorithm: 'RS256',
                expiresIn: 120,
                subject: userId
            });

          // send the JWT back to the user
          res.status(200).json({
            token: jwtBearerToken
          });
          console.log(`User ${userId} logged in successfully`);
          // TODO - multiple options available                              
    }
    else {
        // send status 401 Unauthorized
        res.sendStatus(401); 
    }
}

}

export const apiServer = new ApiServer();
function validatePassword(password: string): boolean {
  // Implement your password validation logic here
  return password === 'rowlocks';
}

