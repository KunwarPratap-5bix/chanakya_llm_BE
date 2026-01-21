import moment from 'moment-timezone';
import { Express, NextFunction, Request, Response } from 'express';
import { __ } from '@lib/i18n';
import { joi, patterns } from '@utils';
import { languages } from '@dto';
import { validate } from '../utils/validations';
import { Platform } from '@enums';

export const validateHeaders = (app: Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.__ = (key: string, ...params: string[]) => __('en', key, ...params);
        res.locals.siteUrl = process.env.SITE_URL || 'SITE_URL';
        res.locals.siteTitle = process.env.SITE_TITLE || 'SITE_TITLE';
        res.locals.currentYear = moment().format('YYYY');

        const route = `/${req.originalUrl.split('/').splice(1, 2).join('/')}/`;
        const routeAction = `/${req.originalUrl.split('/').splice(1, 3).join('/').split('?')[0]}`;
        const excludeHeaderUrls = ['/api/health-check', '/api/api-docs'];

        if (!excludeHeaderUrls.includes(route) && !excludeHeaderUrls.includes(routeAction)) {
            return validate(
                joi
                    .object()
                    .keys({
                        'x-platform': joi
                            .string()
                            .trim()
                            .valid(...Object.values(Platform))
                            .required(),
                        'x-version': joi.string().trim().regex(patterns.version, 'semanticPattern').required(),
                        'x-time-zone': joi.number().required(),
                        'accept-language': joi
                            .string()
                            .trim()
                            .valid(...languages)
                            .required(),
                    })
                    .required(),
                'headers',
                { allowUnknown: true }
            )(req, res, next);
        }
        return next();
    });
};
