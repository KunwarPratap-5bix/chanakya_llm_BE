import { allowedDomainPatterns, isDevEnv, otherAllowedDomains } from '@utils';
import { Express, NextFunction, Request, Response, RequestHandler } from 'express';

export const responseHeaders = (app: Express): void => {
    app.use(((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin as unknown as string;
        const route = `/${req.originalUrl.split('/').splice(1, 2).join('/')}/`;
        const routeAction = `/${req.originalUrl.split('/').splice(1, 3).join('/').split('?')[0]}`;
        const excludeHeaderUrls = ['/api/api-docs/', '/api/health-check'];
        const connectionHeader = req.headers['connection'];
        const isUrlExcluded = excludeHeaderUrls.includes(route) || excludeHeaderUrls.includes(routeAction);
        const validateAccessingDomain = process.env.VALIDATE_ACCESSING_DOMAIN === 'true';

        if (
            validateAccessingDomain &&
            !isUrlExcluded &&
            !allowedDomainPatterns.some(pattern => pattern.test(origin)) &&
            !otherAllowedDomains.includes(origin)
        ) {
            return res.status(403).send('Forbidden');
        }

        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, Referer, User-Agent, X-Requested-With, Content-Type, Accept, Authorization, Accept-Language, Pragma, Cache-Control, Expires, If-Modified-Since, x-platform, x-version, x-time-zone'
        );
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
        res.removeHeader('X-Powered-By');

        if (
            !isDevEnv &&
            !isUrlExcluded &&
            ['POST', 'PUT'].includes(req.method.toUpperCase()) &&
            connectionHeader?.toLowerCase() === 'keep-alive'
        ) {
            res.setHeader('Connection', 'close');
        }
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, Referer, User-Agent, X-Requested-With, Content-Type, Accept, Authorization, Accept-Language, Pragma, Cache-Control, Expires, If-Modified-Since, x-platform, x-version, x-time-zone'
        );

        if (req.method === 'OPTIONS') {
            return res.status(204).send('OK');
        }

        return next();
    }) as RequestHandler);
};
