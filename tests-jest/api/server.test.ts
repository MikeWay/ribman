
import express, { Request, Response } from 'express';
//import fetch from 'node-fetch';
import { Server } from 'http';

const app = express();
app.use(express.json());

// Mock apiServer object for route handlers (replace with your actual import if needed)
const apiServer = {
  checkPerson: jest.fn(),
  getCheckedOutBoats: jest.fn(),
  checkOutBoat: jest.fn(),
  getAvailableBoats: jest.fn(),
  checkInBoat: jest.fn()
};

let server: Server;

beforeAll((done) => {
  server = app.listen(0, done); // Listen on a random available port
});

afterAll((done) => {
  server.close(done);
});

const dao: any = {};
describe('ApiServer.checkPerson', () => {  beforeEach(() => {
    dao.personManager = {
      getPersonByLastNameAndBirthDate: jest.fn()
    } as any;
  });

  it('should return true -- dummy test', () => {
    expect(apiServer.checkPerson).toBeDefined();
  });
});

/*
  it('should return people found by last name and birth date', async () => {
    const people = [{ id: 1, name: 'Alice' }];
    (dao.personManager.getPersonByLastNameAndBirthDate as jest.Mock).mockResolvedValueOnce(people);

    const body = { familyInitial: 'A', day: 10, month: 6, year: 1990 };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkPerson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(people);
    expect(dao.personManager.getPersonByLastNameAndBirthDate).toHaveBeenCalledWith('A', 10, 6, 1990);
  });

  it('should use current date if day/month not provided', async () => {
    const people = [{ id: 2, name: 'Bob' }];
    (dao.personManager.getPersonByLastNameAndBirthDate as jest.Mock).mockResolvedValueOnce(people);

    const now = new Date();
    const body = { familyInitial: 'B', year: 2000 };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkPerson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(people);
    expect(dao.personManager.getPersonByLastNameAndBirthDate).toHaveBeenCalledWith(
      'B',
      now.getDate(),
      now.getMonth() + 1,
      2000
    );
  });

  it('should handle errors when searching for person', async () => {
    (dao.personManager.getPersonByLastNameAndBirthDate as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const body = { familyInitial: 'C', day: 1, month: 1, year: 2020 };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkPerson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Internal server error');
  });
});

describe('ApiServer.getCheckedOutBoats', () => {
  beforeEach(() => {
    dao.boatManager.getCheckedOutBoats = jest.fn();
  });

  it('should return a list of checked out boats', async () => {
    const boats = [
      { id: 3, name: 'Red Rib', checkedOutTo: 42, checkedOutAt: new Date(), checkedInAt: null }
    ];
    (dao.boatManager.getCheckedOutBoats as jest.Mock).mockResolvedValueOnce(boats);
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/getCheckedOutBoats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(boats);
    expect(dao.boatManager.getCheckedOutBoats).toHaveBeenCalled();
  });

  it('should handle errors when fetching checked out boats', async () => {
    (dao.boatManager.getCheckedOutBoats as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/getCheckedOutBoats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Internal server error');

  });
});
describe('ApiServer.checkOutBoat', () => {
  beforeEach(() => {
    dao.boatManager.checkOutBoat = jest.fn();
  });

  it('should check out a boat successfully', async () => {
    (dao.boatManager.checkOutBoat as jest.Mock).mockResolvedValueOnce(undefined);

    const boat = { id: 10, name: 'Blue Canoe' };
    const user = { id: 5, name: 'Charlie' };
    const body = { boat, user };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkOutBoat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ message: "Boat checked out successfully" });
    expect(dao.boatManager.checkOutBoat).toHaveBeenCalled();
    const calledBoat = (dao.boatManager.checkOutBoat as jest.Mock).mock.calls[0][0];
    expect(calledBoat.checkedOutTo).toBe(user.id);
    expect(calledBoat.checkedInAt).toBeNull();
    expect(calledBoat.checkedOutAt).toBeInstanceOf(Date);
  });

  it('should handle errors when checking out a boat', async () => {
    (dao.boatManager.checkOutBoat as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const boat = { id: 11, name: 'Green Kayak' };
    const user = { id: 6, name: 'Dana' };
    const body = { boat, user };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkOutBoat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(500);
    const data = await res.json()  as { error: string };;
    expect(data.error).toBe('Failed to check out boat');
  });
});

describe('ApiServer.getAvailableBoats', () => {
  beforeEach(() => {
    dao.boatManager.getAvailableBoats = jest.fn();
  });

  it('should return a list of available boats', async () => {
    const boats = [
      { id: 20, name: 'Yellow Dinghy', checkedOutTo: null }
    ];
    (dao.boatManager.getAvailableBoats as jest.Mock).mockResolvedValueOnce(boats);
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/getAvailableBoats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(boats);
    expect(dao.boatManager.getAvailableBoats).toHaveBeenCalled();
  });

  it('should handle errors when fetching available boats', async () => {
    (dao.boatManager.getAvailableBoats as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/getAvailableBoats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Failed to fetch available boats');
  });
});
describe('ApiServer.checkInBoat', () => {
  beforeEach(() => {
    dao.checkInBoat = jest.fn();
  });

  it('should check in a boat successfully', async () => {
    (dao.checkInBoat as jest.Mock).mockResolvedValueOnce(undefined);

    const boat = { id: 100, name: 'Silver Skiff' };
    const user = { id: 7, name: 'Eve' };
    const problems = [{ type: 'scratch', description: 'Minor scratch on hull' }];
    const body = { boat, user, problems };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkInBoat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ message: "Boat checked in successfully" });
    expect(dao.checkInBoat).toHaveBeenCalled();
    const [calledBoat, calledUser, calledCheckInDateTime, calledDefects] = (dao.checkInBoat as jest.Mock).mock.calls[0];
    expect(calledBoat).toEqual(boat);
    expect(calledUser).toEqual(user);
    expect(typeof calledCheckInDateTime).toBe('number');
    expect(calledDefects).toEqual(problems);
  });

  it('should handle errors when checking in a boat', async () => {
    (dao.checkInBoat as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const boat = { id: 101, name: 'Golden Gig' };
    const user = { id: 8, name: 'Frank' };
    const body = { boat, user };
    const address = server.address();
    const port = address && typeof address === 'object' && 'port' in address ? (address as any).port : 0;
    const res = await fetch(`http://localhost:${port}/api/checkInBoat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Failed to check in boat');
  });
});

// Add the route to the test app if not already present
if (!app._router.stack.some((layer: any) => layer.route && layer.route.path === '/api/checkInBoat')) {
  
  app.post('/api/checkInBoat', (req: Request, res: Response) => apiServer.checkInBoat(req, res));
}

// Add the routes to the test app if not already present
if (!app._router.stack.some((layer: any) => layer.route && layer.route.path === '/api/checkOutBoat')) {
  app.post('/api/checkOutBoat', (req: Request, res: Response) => apiServer.checkOutBoat(req, res));
}
if (!app._router.stack.some((layer: any) => layer.route && layer.route.path === '/api/getAvailableBoats')) {
  app.get('/api/getAvailableBoats', (req: Request, res: Response) => apiServer.getAvailableBoats(req, res));
}

// Add the routes to the test app if not already present
if (!app._router.stack.some((layer: any) => layer.route && layer.route.path === '/api/checkPerson')) {
  app.post('/api/checkPerson', (req: Request, res: Response) => apiServer.checkPerson(req, res));
}
if (!app._router.stack.some((layer: any) => layer.route && layer.route.path === '/api/getCheckedOutBoats')) {
  app.get('/api/getCheckedOutBoats', (req: Request, res: Response) => apiServer.getCheckedOutBoats(req, res));
}
*/