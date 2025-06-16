import { Request } from 'express';



export class SessionController {
    public setPageBody(req: Request, pageBody: string): void {
        req.session.pageBody = pageBody;
    }

    public getPageBody(req: Request): string {
        return req.session.pageBody || 'page1';
    }
}