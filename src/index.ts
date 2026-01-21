import { env } from 'custom-env';
env('api');
import fs from 'fs';
import http from 'http';
import https from 'https';
import 'express-async-errors';
import express, { Express } from 'express';
import routes from './routes';
import { initSocket } from './socket';
import { logger } from '@utils';
import * as middlewares from './middlewares';
import { setSocketInstance } from './socket/socketInstance';

const app: Express = express();

middlewares.foundations(app);
middlewares.localizations(app);
middlewares.logRequests(app);
middlewares.responseHeaders(app);
middlewares.swagger(app);
middlewares.rateLimiter(app);
middlewares.validateHeaders(app);

app.use('/api', routes);

middlewares.errorHandling(app);

let server: http.Server | https.Server;

if (process.env.SERVER_MODE === 'https') {
    server = https.createServer(
        {
            key: fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8'),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8'),
            ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8'),
        },
        app
    );
} else {
    server = http.createServer(app);
}

(async () => {
    try {
        server.listen(Number(process.env.PORT || 7000));
        const io = await initSocket(server);
        setSocketInstance(io);
        logger.info(`🚀 ${process.env.SERVER_NAME} started at ${process.env.SITE_URL} 🚀`);
    } catch (e) {
        logger.error('🚨🚨 Server startup failed with error 🚨🚨', e);
        throw e;
    }
})();

module.exports = server;
