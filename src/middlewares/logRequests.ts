import morgan from 'morgan';
import { Express } from 'express';
import { logger } from '@utils';

export const logRequests = (app: Express) => {
    app.use(
        morgan(':method :url :status :res[content-length] - :response-time ms', {
            stream: {
                write: (message: string) => logger.http(message),
            },
            skip: () => process.env.LOG_REQUESTS === 'false',
        })
    );
};
