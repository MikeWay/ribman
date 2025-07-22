import { dao } from "../model/dao";
import { Request, Response } from 'express';

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
    // get familyInitial from the request
    const familyInitial = req.body.familyInitial || '';

    
    try {
      const person = await dao.personManager.getPersonByLastNameAndBirthDate(
        familyInitial.toString(),
        Number(day),
        Number(month)
      );
      return res.json(person);
    } catch (error) {
      console.error("Error in checkPerson:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const apiServer = new ApiServer();
        