import { Express, NextFunction, Request, Response } from 'express';
import { __ } from '@lib/i18n';
import { Languages } from '@dto';
import { response, ResponseTypes } from '@lib/http-response';

export const localizations = (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        const language = (req.headers['accept-language'] ?? 'en') as Languages;
        req.__ = (key: string, ...params: string[]) => __(language, key, ...params);

        for (const method in response) {
            res[method as keyof ResponseTypes] = response[method as keyof ResponseTypes];
        }

        return next();
    });
};
