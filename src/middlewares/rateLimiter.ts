import { Express, Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

const createRateLimiter = (method: string) => {
    const defaultWindowMs = 15 * 60 * 1000;
    const defaultLimit = 100;

    const windowMs = Number(process.env[`${method}_REQUEST_RATE_WINDOW_MINUTES`]) * 60 * 1000 || defaultWindowMs;
    const limit = Number(process.env[`${method}_REQUEST_RATE_LIMIT`]) || defaultLimit;

    return rateLimit({
        windowMs,
        limit,
        keyGenerator: (req: Request) => {
            const baseKey = req.session || req.ip;
            const routeKey = req.originalUrl.split('?')[0];

            return `${baseKey}:${routeKey}`;
        },
        skip: (req: Request) => {
            const route = `/${req.originalUrl.split('/').splice(1, 2).join('/')}/`;
            const routeAction = `/${req.originalUrl.split('/').splice(1, 3).join('/').split('?')[0]}`;
            const excludeHeaderUrls = ['/api/health-check'];

            return excludeHeaderUrls.includes(route) || excludeHeaderUrls.includes(routeAction);
        },
        statusCode: 429,
        legacyHeaders: false,
        standardHeaders: false,
        message: (req: Request, res: Response) => res.tooManyRequests(null, req.__('TOO_MANY_REQUESTS')),
    });
};

const rateLimiters: Record<string, RateLimitRequestHandler> = {
    GET: createRateLimiter('GET'),
    POST: createRateLimiter('POST'),
    PUT: createRateLimiter('PUT'),
    PATCH: createRateLimiter('PATCH'),
    DELETE: createRateLimiter('DELETE'),
};

const useRateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    const limiter = rateLimiters[method];

    if (limiter) {
        return limiter(req, res, next);
    }

    return next();
};

export const rateLimiter = (app: Express) => {
    app.use(useRateLimiter);
};
