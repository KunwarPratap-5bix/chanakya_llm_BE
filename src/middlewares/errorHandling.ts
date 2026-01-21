import { Express, NextFunction, Request, Response } from 'express';
import { __ } from '@lib/i18n';
import { logger } from '@utils';
import { ExpressError } from '@dto';

export const errorHandling = (app: Express) => {
    app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
        logger.error(`Error in request:: ${req.originalUrl}`, err);
        if (res.headersSent) {
            next(err);
        }

        if (err.message === 'EntityNotFound') {
            res.notFound(null, __('en', 'NOT_FOUND'));
        }

        res.status(err.status || 500).send({
            success: false,
            data: [],
            message: __('en', 'GENERAL_ERROR'),
        });
    });

    app.use((req: Request, res: Response) => {
        logger.error(`URL NOT FOUND: ${req.originalUrl}`);
        res.status(404).send({
            success: false,
            data: [],
            message: __('en', 'NOT_FOUND'),
        });
    });
};
