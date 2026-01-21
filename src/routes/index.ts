import fs from 'fs';
import { Router, Request, Response } from 'express';

const routers = Router();
const routes: string[] = fs.readdirSync(__dirname);

routes.forEach(async (route: string) => {
    if (fs.lstatSync(`${__dirname}/${route}`).isDirectory()) {
        const { router } = await import(`./${route}`);
        routers.use(`/${route}`, router);
    }
});

routers.get('/health-check', (req: Request, res: Response) => {
    return res.success(null, req.__('HEALTH_CHECK'));
});

export default routers;
