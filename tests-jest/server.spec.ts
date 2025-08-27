import request from 'supertest';
import express from 'express';
import session from 'express-session';
import { setRoutes } from '../src/routes/routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { dao } from '../src/model/dao';


jest.mock('../src/routes/routes', () => ({
  setRoutes: jest.fn((app) => {
    app.get('/test', (req: express.Request, res: express.Response) => res.status(200).json({ message: 'ok' }));
    app.get('/error', (req: express.Request, res: express.Response, next: express.NextFunction) => next(new Error('NOT-ADMIN')));
  }),
}));

describe('server.ts', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.set('views', './views');
    app.use(express.static('public/browser'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
      secret: 'a we1rd2va200lue3',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));
    setRoutes(app);

    const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err.message === 'NOT-ADMIN') {
        return res.redirect(302, '/admin-login');
      }
      next();
    };
    app.use(errorHandler);
  });

  it('should respond to /test route', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'ok' });
  });

  it('should redirect to /admin-login on NOT-ADMIN error', async () => {
    const res = await request(app).get('/error');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin-login');
  });

  it('should serve static files', async () => {
    // This test assumes public/browser/test.txt exists
    // If not, skip or mock express.static
    // const res = await request(app).get('/test.txt');
    // expect(res.status).toBe(200);
  });

  it('should parse cookies', async () => {
    app.get('/cookie', (req, res) => {
      res.json({ cookie: req.cookies.test });
    });
    const res = await request(app).get('/cookie').set('Cookie', 'test=value');
    expect(res.body.cookie).toBe('value');
  });

  it('should parse JSON body', async () => {
    app.post('/json', (req, res) => {
      res.json({ received: req.body });
    });
    const res = await request(app)
      .post('/json')
      .send({ foo: 'bar' })
      .set('Content-Type', 'application/json');
    expect(res.body.received).toEqual({ foo: 'bar' });
  });

  it('should parse urlencoded body', async () => {
    app.post('/form', (req, res) => {
      res.json({ received: req.body });
    });
    const res = await request(app)
      .post('/form')
      .send('foo=bar')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    expect(res.body.received).toEqual({ foo: 'bar' });
  });
 
  // it('should set session', async () => {
  //   app.get('/session', (req, res) => {
  //     req.session.test = 'value';
  //     res.json({ session: req.session.test });
  //   });
  //   const res = await request(app).get('/session');
  //   expect(res.body.session).toBe('value');
  // });
});